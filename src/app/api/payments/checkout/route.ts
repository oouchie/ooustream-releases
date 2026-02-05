import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/lib/stripe';
import { getCustomerPrice } from '@/lib/pricing';
import { BillingPeriod } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const billingPeriod: BillingPeriod = body.billingPeriod || 'monthly';

    // Validate billing period
    if (!['monthly', '6month', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', session.customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      customer.id,
      customer.email,
      customer.name,
      customer.stripe_customer_id
    );

    // Update customer with Stripe ID if new
    if (!customer.stripe_customer_id) {
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customer.id);
    }

    // Calculate price
    const amount = getCustomerPrice(customer, billingPeriod);

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/billing/cancel`;

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: customer.id,
      stripeCustomerId,
      amount,
      billingPeriod,
      customerEmail: customer.email,
      successUrl,
      cancelUrl,
    });

    // Create pending payment record
    await supabase.from('payments').insert({
      customer_id: customer.id,
      stripe_checkout_session_id: checkoutSession.id,
      amount,
      status: 'pending',
      billing_period: billingPeriod,
      payment_type: 'one_time',
      description: `OOUStream Service - ${billingPeriod}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
