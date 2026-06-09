import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAdminAuth } from '@/lib/auth';

// Diagnoses the live Stripe webhook registration so a stray `www.`/trailing-slash/http
// URL (which 3xx-redirects and silently drops every payment — see CLAUDE.md "Webhook URL")
// is caught immediately instead of after customers go missing from the CRM.
// Hit: /api/admin/webhook-health?key=<ADMIN_PASSWORD>

const EXPECTED_URL = 'https://ooustream.com/api/webhooks/stripe';
const REQUIRED_EVENTS = [
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
];

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const isAdmin =
    (key && process.env.ADMIN_PASSWORD && key === process.env.ADMIN_PASSWORD) ||
    (await verifyAdminAuth());

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });

  const issues: string[] = [];

  // Env sanity (booleans only — never leak secret values)
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    issues.push('STRIPE_WEBHOOK_SECRET is not set — signature verification will fail (HTTP 400).');
  }

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });

    const summary = endpoints.data.map((ep) => {
      const url = ep.url;
      const events = ep.enabled_events;
      const handlesAll = events.includes('*');
      const missingEvents = handlesAll
        ? []
        : REQUIRED_EVENTS.filter((e) => !events.includes(e));

      const urlProblems: string[] = [];
      if (url.startsWith('http://')) urlProblems.push('uses http:// (redirects to https)');
      if (/\/\/www\./i.test(url)) urlProblems.push('uses www. subdomain (307-redirects to apex)');
      if (url.replace(/^https?:\/\/[^/]+/, '').endsWith('/')) {
        urlProblems.push('has a trailing slash (308-redirects)');
      }
      if (ep.status !== 'enabled') urlProblems.push(`status is "${ep.status}" (not enabled)`);

      // Flag the canonical webhook endpoint(s) — those pointing at this app's path
      const isOurWebhook = url.includes('/api/webhooks/stripe');
      if (isOurWebhook) {
        urlProblems.forEach((p) => issues.push(`Webhook ${url}: ${p}`));
        missingEvents.forEach((e) => issues.push(`Webhook ${url}: missing required event "${e}"`));
        if (url !== EXPECTED_URL && urlProblems.length === 0) {
          issues.push(`Webhook ${url}: not the expected apex URL (${EXPECTED_URL}) — verify it still resolves without redirect.`);
        }
      }

      return {
        id: ep.id,
        url,
        status: ep.status,
        is_our_webhook: isOurWebhook,
        enabled_events: handlesAll ? '*' : events,
        missing_required_events: missingEvents,
        url_problems: urlProblems,
      };
    });

    const ourEndpoints = summary.filter((s) => s.is_our_webhook);
    if (ourEndpoints.length === 0) {
      issues.push(`No Stripe webhook endpoint points at ${EXPECTED_URL} — payments will never reach the handler.`);
    }

    return NextResponse.json({
      ok: issues.length === 0,
      expected_url: EXPECTED_URL,
      stripe_webhook_secret_set: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      email_from: process.env.EMAIL_FROM || '(default oouchie@ooustream.com)',
      issues,
      endpoints: summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe call failed' },
      { status: 500 }
    );
  }
}
