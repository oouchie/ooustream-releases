import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLAN_PRICES, PERIOD_LABELS } from '@/lib/pricing';
import { BillingPeriod, PlanType } from '@/types';

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
    const { email, billingPeriod, planType = 'standard' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!billingPeriod || !['monthly', '6month', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    if (!['standard', 'pro'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const stripe = getStripe();
    const amount = PLAN_PRICES[planType as PlanType][billingPeriod as BillingPeriod];
    const baseUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';
    const planLabel = planType === 'pro' ? 'Pro' : 'Standard';

    const session = await stripe.checkout.sessions.create({
      customer_email: email.toLowerCase().trim(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `OOUStream ${planLabel} - ${PERIOD_LABELS[billingPeriod as BillingPeriod]}`,
              description: `${planLabel} plan (${planType === 'pro' ? '4 connections' : '2 connections'}) for ${PERIOD_LABELS[billingPeriod as BillingPeriod]}`,
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
        plan_type: planType,
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
