import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { calculateNewExpiry } from '@/lib/pricing';
import { sendWelcomeEmail, sendNewCustomerNotification } from '@/lib/email';
import { BillingPeriod } from '@/types';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServerClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session
) {
  const billingPeriod = session.metadata?.billing_period as BillingPeriod;
  const planType = session.metadata?.plan_type || 'standard';
  const source = session.metadata?.source;

  if (!billingPeriod) {
    console.error('Missing billing_period in checkout session metadata');
    return;
  }

  // Idempotency: skip if we already processed this checkout session
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  if (existingPayment) {
    console.log(`Checkout session ${session.id} already processed, skipping`);
    return;
  }

  // Landing page signup — no existing customer
  if (source === 'landing_page') {
    await handleLandingPageSignup(supabase, session, billingPeriod, planType);
    return;
  }

  // Existing customer checkout (from portal billing page)
  const customerId = session.metadata?.customer_id;
  if (!customerId) {
    console.error('Missing customer_id in checkout session metadata');
    return;
  }

  // Get current customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('expiry_date')
    .eq('id', customerId)
    .single();

  // Calculate new expiry date
  const currentExpiry = customer?.expiry_date ? new Date(customer.expiry_date) : null;
  const newExpiry = calculateNewExpiry(currentExpiry, billingPeriod);

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_payment_intent_id: session.payment_intent as string,
      period_start: new Date().toISOString().split('T')[0],
      period_end: newExpiry.toISOString().split('T')[0],
      plan_type: planType,
    })
    .eq('stripe_checkout_session_id', session.id);

  // Update customer expiry date and status
  await supabase
    .from('customers')
    .update({
      expiry_date: newExpiry.toISOString().split('T')[0],
      status: 'Active',
      billing_period: billingPeriod,
      plan_type: planType,
    })
    .eq('id', customerId);

  // Log to audit
  await supabase.from('audit_logs').insert({
    action: 'payment_received',
    table_name: 'payments',
    record_id: customerId,
    performed_by: 'stripe_webhook',
    details: {
      amount: session.amount_total,
      billing_period: billingPeriod,
      plan_type: planType,
      new_expiry: newExpiry.toISOString(),
    },
  });

  console.log(`Payment successful for customer ${customerId}, new expiry: ${newExpiry}`);
}

async function handleLandingPageSignup(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session,
  billingPeriod: BillingPeriod,
  planType: string
) {
  const email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
  const name = session.customer_details?.name || email.split('@')[0];
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

  if (!email) {
    console.error('No email found in landing page checkout session');
    return;
  }

  // Check if customer already exists by email
  const { data: existing } = await supabase
    .from('customers')
    .select('id, expiry_date')
    .eq('email', email)
    .single();

  const newExpiry = calculateNewExpiry(
    existing?.expiry_date ? new Date(existing.expiry_date) : null,
    billingPeriod
  );
  const expiryStr = newExpiry.toISOString().split('T')[0];

  let customerId: string;

  if (existing) {
    // Existing customer — update their record
    customerId = existing.id;
    await supabase
      .from('customers')
      .update({
        expiry_date: expiryStr,
        status: 'Active',
        billing_period: billingPeriod,
        plan_type: planType,
        ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      })
      .eq('id', customerId);
  } else {
    // New customer — create record
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        name,
        email,
        phone: '',
        service_type: 'Cable',
        status: 'Active',
        plan_type: planType,
        billing_type: 'manual',
        billing_period: billingPeriod,
        expiry_date: expiryStr,
        reseller: null,
        stripe_customer_id: stripeCustomerId,
        auto_renew_enabled: false,
        username_1: '',
        password_1: '',
      })
      .select('id')
      .single();

    if (insertError || !newCustomer) {
      console.error('Failed to create customer from landing page:', insertError);
      return;
    }
    customerId = newCustomer.id;
  }

  // Create payment record
  await supabase.from('payments').insert({
    customer_id: customerId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    amount: session.amount_total || 0,
    status: 'succeeded',
    billing_period: billingPeriod,
    plan_type: planType,
    payment_type: 'one_time',
    period_start: new Date().toISOString().split('T')[0],
    period_end: expiryStr,
    description: `OOUStream ${planType === 'pro' ? 'Pro' : 'Standard'} - ${billingPeriod}`,
  });

  // Log to audit
  await supabase.from('audit_logs').insert({
    action: existing ? 'payment_received' : 'landing_page_signup',
    table_name: 'customers',
    record_id: customerId,
    performed_by: 'stripe_webhook',
    details: {
      amount: session.amount_total,
      billing_period: billingPeriod,
      plan_type: planType,
      new_expiry: newExpiry.toISOString(),
      source: 'landing_page',
      is_new_customer: !existing,
    },
  });

  // Send emails (don't let email failures break the webhook)
  try {
    await sendWelcomeEmail({
      email,
      name,
      planType,
      billingPeriod,
      expiryDate: expiryStr,
    });
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }

  try {
    await sendNewCustomerNotification({
      customerEmail: email,
      customerName: name,
      planType,
      billingPeriod,
      amount: session.amount_total || 0,
      source: 'landing page',
    });
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }

  console.log(`Landing page ${existing ? 'renewal' : 'signup'} for ${email}, customer ${customerId}, expiry: ${expiryStr}`);
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  // This handles subscription renewals
  const stripeCustomerId = invoice.customer as string;

  // Find customer by Stripe ID
  const { data: customer } = await supabase
    .from('customers')
    .select('id, billing_period, expiry_date')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (!customer) {
    console.error('Customer not found for Stripe ID:', stripeCustomerId);
    return;
  }

  const billingPeriod = customer.billing_period as BillingPeriod || 'monthly';
  const currentExpiry = customer.expiry_date ? new Date(customer.expiry_date) : null;
  const newExpiry = calculateNewExpiry(currentExpiry, billingPeriod);

  // Get payment intent ID from invoice (cast to any for flexibility with Stripe types)
  const invoiceData = invoice as unknown as { payment_intent?: string | { id: string } | null };
  const paymentIntentId = typeof invoiceData.payment_intent === 'string'
    ? invoiceData.payment_intent
    : invoiceData.payment_intent?.id || null;

  // Create payment record
  await supabase.from('payments').insert({
    customer_id: customer.id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: paymentIntentId,
    amount: invoice.amount_paid,
    status: 'succeeded',
    billing_period: billingPeriod,
    payment_type: 'subscription',
    period_start: new Date().toISOString().split('T')[0],
    period_end: newExpiry.toISOString().split('T')[0],
    description: `OOUStream Subscription - ${billingPeriod}`,
  });

  // Update customer
  await supabase
    .from('customers')
    .update({
      expiry_date: newExpiry.toISOString().split('T')[0],
      status: 'Active',
    })
    .eq('id', customer.id);

  console.log(`Subscription payment for customer ${customer.id}, new expiry: ${newExpiry}`);
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  const stripeCustomerId = invoice.customer as string;

  // Find customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (!customer) return;

  // Record failed payment
  await supabase.from('payments').insert({
    customer_id: customer.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due,
    status: 'failed',
    billing_period: 'monthly',
    payment_type: 'subscription',
    failure_reason: 'Payment failed',
  });

  console.log(`Payment failed for customer ${customer.id}`);
}
