import { NextRequest, NextResponse } from 'next/server';
import { createTrialSetupIntent } from '@/lib/stripe';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Creates a Stripe SetupIntent so the trial form can collect a card (no charge).
// The client confirms it with Elements; the card fingerprint is read back
// server-side in /api/trial. Rate-limited to deter SetupIntent spamming.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`trial-si:${ip}`, {
      max: 6,
      windowSeconds: 900,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const { clientSecret, setupIntentId } = await createTrialSetupIntent();
    return NextResponse.json({ clientSecret, setupIntentId });
  } catch (error) {
    console.error('Trial setup-intent error:', error);
    return NextResponse.json(
      { error: 'Could not start trial. Please try again.' },
      { status: 500 },
    );
  }
}
