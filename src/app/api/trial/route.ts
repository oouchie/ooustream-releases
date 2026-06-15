import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendNewCustomerNotification } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getTrialCardFingerprint } from '@/lib/stripe';
import { lookupPhoneLineType } from '@/lib/twilio-lookup';
import {
  checkTrialEligibility,
  createTrial,
  normalizePhone,
  type TrialSignals,
} from '@/lib/trial-abuse';
import { provisionTrialCustomer } from '@/lib/trial-provision';

// Public free-trial signup. Card is required (collected via Stripe Elements as a
// SetupIntent — no charge) so we can read its fingerprint to block trial farming.
// Layers signals: card fingerprint + browser fingerprint + normalized email/phone
// + IP + VOIP line type, scored in src/lib/trial-abuse.ts.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`trial:${ip}`, {
      max: 3,
      windowSeconds: 900,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { name, email, phone, device, setupIntentId, browserVisitorId } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 },
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (!setupIntentId || typeof setupIntentId !== 'string') {
      return NextResponse.json(
        { error: 'A verified payment card is required to start the trial.' },
        { status: 400 },
      );
    }

    // Read the card fingerprint SERVER-SIDE (never trust the client).
    const card = await getTrialCardFingerprint(setupIntentId);
    if (!card || card.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Card verification did not complete. Please re-enter your card.' },
        { status: 400 },
      );
    }
    // The card fingerprint is the spine of abuse detection (survives email/phone
    // changes). A confirmed card MUST yield one; if it doesn't, refuse rather
    // than silently dropping the strongest signal.
    if (!card.fingerprint) {
      return NextResponse.json(
        { error: 'We could not verify your card. Please use a standard credit or debit card.' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Already a customer? Don't let them grab a trial.
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 },
      );
    }

    // VOIP line-type check (fail-open, flag-gated inside the helper).
    const phoneE164 = normalizePhone(phone);
    let isVoip = false;
    if (phoneE164) {
      const lt = await lookupPhoneLineType(phoneE164);
      isVoip = lt.isVoip;
    }

    const signals: TrialSignals = {
      email,
      phone,
      cardFingerprint: card.fingerprint,
      browserVisitorId: typeof browserVisitorId === 'string' ? browserVisitorId : undefined,
      ipAddress: ip !== 'unknown' ? ip : undefined,
      isVpn: isVoip,
      userAgent: request.headers.get('user-agent') ?? undefined,
    };

    const evaluation = await checkTrialEligibility(supabase, signals);
    const meta = { name, device: device || undefined, setupIntentId };

    // DENIED — record the attempt (it's a future signal) and refuse.
    if (evaluation.decision === 'denied') {
      await createTrial(supabase, signals, evaluation, null, meta);
      return NextResponse.json(
        {
          status: 'denied',
          error:
            evaluation.reasons[0] ||
            'We could not start a free trial for this account.',
          reasons: evaluation.reasons,
        },
        { status: 403 },
      );
    }

    // REVIEW — record + flag for an admin; do NOT provision until approved.
    if (evaluation.decision === 'review') {
      const recorded = await createTrial(supabase, signals, evaluation, null, meta);
      // A unique-index conflict means a live trial / used SetupIntent already
      // exists for this identity — treat it as a deny, not a review.
      if (!recorded.ok && recorded.conflict) {
        return NextResponse.json(
          {
            status: 'denied',
            error: 'A free trial has already been started for this card or account.',
          },
          { status: 403 },
        );
      }
      try {
        await sendNewCustomerNotification({
          customerEmail: normalizedEmail,
          customerName: name,
          planType: 'standard',
          billingPeriod: '24hr trial',
          amount: 0,
          source: `FREE TRIAL — NEEDS REVIEW (risk ${evaluation.riskScore}): ${evaluation.reasons.join('; ') || 'flagged'}`,
        });
      } catch (err) {
        console.error('Trial review notification failed:', err);
      }
      return NextResponse.json({
        status: 'review',
        message:
          "Thanks! We're reviewing your trial request and will email you shortly.",
      });
    }

    // ACTIVE — record the trial FIRST so the DB unique indexes are the race-proof
    // arbiter (concurrent same-card/email requests can't both win), THEN provision.
    const recorded = await createTrial(supabase, signals, evaluation, null, meta);
    if (!recorded.ok) {
      if (recorded.conflict) {
        return NextResponse.json(
          {
            status: 'denied',
            error: 'A free trial has already been started for this card or account.',
          },
          { status: 403 },
        );
      }
      // Insert failed for another reason (e.g. migration not yet run) — fail safe.
      return NextResponse.json(
        { error: 'Could not start your trial right now. Please try again shortly.' },
        { status: 503 },
      );
    }

    const provision = await provisionTrialCustomer(supabase, {
      name,
      email: normalizedEmail,
      phone,
      device,
      riskScore: evaluation.riskScore,
      source: 'free trial page (/trial)',
    });
    if ('error' in provision) {
      console.error('Trial provisioning failed:', provision.error);
      // Roll back the trial row we just recorded so a transient failure doesn't
      // leave an orphaned 'active' trial that would block the user's retry.
      await supabase.from('trials').delete().eq('id', recorded.id);
      return NextResponse.json(
        { error: 'Could not create your trial. Please try again.' },
        { status: 500 },
      );
    }

    // Link the just-created customer to the trial row.
    await supabase
      .from('trials')
      .update({ customer_id: provision.customerId })
      .eq('id', recorded.id);

    await supabase.from('audit_logs').insert({
      action: 'trial_signup',
      table_name: 'customers',
      record_id: provision.customerId,
      performed_by: 'trial_page',
      details: {
        name,
        email: normalizedEmail,
        phone,
        device,
        risk_score: evaluation.riskScore,
        card_brand: card.brand,
        card_last4: card.last4,
      },
    });

    try {
      await sendNewCustomerNotification({
        customerEmail: normalizedEmail,
        customerName: name,
        planType: 'standard',
        billingPeriod: '24hr trial',
        amount: 0,
        source: `free trial page — Device: ${device || 'Not specified'} — set up credentials`,
      });
    } catch (err) {
      console.error('Trial notification failed:', err);
    }

    return NextResponse.json({
      status: 'active',
      message:
        "Your 24-hour free trial is being set up — we'll email your login credentials shortly.",
    });
  } catch (error) {
    console.error('Trial signup error:', error);
    return NextResponse.json(
      { error: 'Failed to start trial. Please try again.' },
      { status: 500 },
    );
  }
}
