import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAdminAuth } from '@/lib/auth';

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

  try {
    const account = await stripe.accounts.retrieve();
    return NextResponse.json({
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      capabilities: account.capabilities,
      requirements: account.requirements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe call failed' },
      { status: 500 }
    );
  }
}
