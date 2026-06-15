import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Create or retrieve Stripe customer for a portal customer
export async function getOrCreateStripeCustomer(
  customerId: string,
  email: string,
  name: string,
  existingStripeCustomerId?: string | null
): Promise<string> {
  const stripe = getStripe();

  // Verify existing ID is valid on the current Stripe account — otherwise
  // a stale ID (from a prior account) causes "No such customer" at checkout.
  if (existingStripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(existingStripeCustomerId);
      if (!('deleted' in existing && existing.deleted)) {
        return existingStripeCustomerId;
      }
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== 'resource_missing') throw err;
    }
  }

  const stripeCustomer = await stripe.customers.create({
    email,
    name,
    metadata: {
      portal_customer_id: customerId,
    },
  });

  return stripeCustomer.id;
}

// Create a Checkout session for payment
export async function createCheckoutSession({
  customerId,
  stripeCustomerId,
  amount,
  billingPeriod,
  planType = 'standard',
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  stripeCustomerId: string;
  amount: number; // in cents
  billingPeriod: 'monthly' | '6month' | 'yearly';
  planType?: 'standard' | 'pro';
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const periodLabels = {
    monthly: '1 Month',
    '6month': '6 Months',
    yearly: '1 Year',
  };

  const planLabel = planType === 'pro' ? 'Pro' : 'Standard';

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    // Let Stripe show all enabled payment methods (Card, Cash App, Apple Pay, etc.)
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `OOUStream ${planLabel} - ${periodLabels[billingPeriod]}`,
            description: `${planLabel} plan (${planType === 'pro' ? '4 connections' : '2 connections'}) for ${periodLabels[billingPeriod]}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customer_id: customerId,
      billing_period: billingPeriod,
      plan_type: planType,
    },
  });

  return session;
}

// --- Free-trial card-on-file (anti-abuse) ---------------------------------
// We require a card to start a free trial purely to read its stable
// card.fingerprint (same across emails/names) so one card can't farm trials.
// A SetupIntent saves the card WITHOUT charging. No customer is attached at
// this stage — the fingerprint is all we need for abuse detection, and a real
// Stripe customer is created later (getOrCreateStripeCustomer) if they convert.

export async function createTrialSetupIntent(): Promise<{
  clientSecret: string;
  setupIntentId: string;
}> {
  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: ['card'],
    usage: 'off_session',
    metadata: { purpose: 'free_trial_verification' },
  });
  if (!setupIntent.client_secret) {
    throw new Error('SetupIntent created without a client_secret');
  }
  return { clientSecret: setupIntent.client_secret, setupIntentId: setupIntent.id };
}

/**
 * Read the card fingerprint for a confirmed SetupIntent — SERVER-SIDE and
 * authoritative. Never trust a fingerprint sent from the browser. Returns null
 * if the SetupIntent isn't confirmed / has no card (caller decides how strict).
 */
export async function getTrialCardFingerprint(setupIntentId: string): Promise<{
  fingerprint: string | null;
  brand: string | null;
  last4: string | null;
  status: string;
} | null> {
  const stripe = getStripe();
  try {
    const si = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ['payment_method'],
    });
    const pm = si.payment_method;
    if (!pm || typeof pm === 'string' || !pm.card) {
      return { fingerprint: null, brand: null, last4: null, status: si.status };
    }
    return {
      fingerprint: pm.card.fingerprint ?? null,
      brand: pm.card.brand ?? null,
      last4: pm.card.last4 ?? null,
      status: si.status,
    };
  } catch (err) {
    console.error('getTrialCardFingerprint failed:', err);
    return null;
  }
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
