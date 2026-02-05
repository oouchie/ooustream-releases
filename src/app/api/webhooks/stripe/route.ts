import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';
import { calculateNewExpiry, PERIOD_DAYS } from '@/lib/pricing';
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
  const customerId = session.metadata?.customer_id;
  const billingPeriod = session.metadata?.billing_period as BillingPeriod;

  if (!customerId || !billingPeriod) {
    console.error('Missing metadata in checkout session');
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
    })
    .eq('stripe_checkout_session_id', session.id);

  // Update customer expiry date and status
  await supabase
    .from('customers')
    .update({
      expiry_date: newExpiry.toISOString().split('T')[0],
      status: 'Active',
      billing_period: billingPeriod,
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
      new_expiry: newExpiry.toISOString(),
    },
  });

  console.log(`Payment successful for customer ${customerId}, new expiry: ${newExpiry}`);
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
