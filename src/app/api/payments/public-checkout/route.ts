import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Standard prices in cents
const STANDARD_PRICES: Record<string, number> = {
  monthly: 2000,   // $20.00
  '6month': 9000,  // $90.00
  yearly: 17000,   // $170.00
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: '1 Month',
  '6month': '6 Months',
  yearly: '1 Year',
};

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, billingPeriod } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!billingPeriod || !['monthly', '6month', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const stripe = getStripe();
    const amount = STANDARD_PRICES[billingPeriod];
    const baseUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer_email: email.toLowerCase().trim(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `OOUStream Service - ${PERIOD_LABELS[billingPeriod]}`,
              description: `Premium IPTV subscription for ${PERIOD_LABELS[billingPeriod]}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        billing_period: billingPeriod,
        source: 'landing_page',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Public checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
