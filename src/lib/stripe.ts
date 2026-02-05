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
  // Return existing if we have it
  if (existingStripeCustomerId) {
    return existingStripeCustomerId;
  }

  const stripe = getStripe();

  // Create new Stripe customer
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
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  stripeCustomerId: string;
  amount: number; // in cents
  billingPeriod: 'monthly' | '6month' | 'yearly';
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

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `OOUStream Service - ${periodLabels[billingPeriod]}`,
            description: `Subscription renewal for ${periodLabels[billingPeriod]}`,
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
    },
  });

  return session;
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
