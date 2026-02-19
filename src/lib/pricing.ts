import { Customer, BillingPeriod, PlanType } from '@/types';

// Standard prices in cents (2 connections)
export const STANDARD_PRICES: Record<BillingPeriod, number> = {
  monthly: 2000,   // $20
  '6month': 9000,  // $90
  yearly: 17000,   // $170
};

// Pro prices in cents (4 connections / multiview)
export const PRO_PRICES: Record<BillingPeriod, number> = {
  monthly: 3500,   // $35
  '6month': 17500, // $175
  yearly: 33500,   // $335
};

// Combined price lookup by plan type
export const PLAN_PRICES: Record<PlanType, Record<BillingPeriod, number>> = {
  standard: STANDARD_PRICES,
  pro: PRO_PRICES,
};

// Connections per plan
export const PLAN_CONNECTIONS: Record<PlanType, number> = {
  standard: 2,
  pro: 4,
};

// Get the period duration in days
export const PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

// Get display labels for billing periods
export const PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: '1 Month',
  '6month': '6 Months',
  yearly: '1 Year',
};

// Get the price for a customer, checking for custom pricing first
export function getCustomerPrice(
  customer: Pick<Customer, 'custom_price_monthly' | 'custom_price_6month' | 'custom_price_yearly' | 'plan_type'>,
  period: BillingPeriod
): number {
  const customPriceMap: Record<BillingPeriod, number | null> = {
    monthly: customer.custom_price_monthly,
    '6month': customer.custom_price_6month,
    yearly: customer.custom_price_yearly,
  };

  const customPrice = customPriceMap[period];
  if (customPrice !== null && customPrice !== undefined) {
    return customPrice;
  }

  const planType = customer.plan_type || 'standard';
  return PLAN_PRICES[planType][period];
}

// Check if customer has any custom pricing
export function hasCustomPricing(
  customer: Pick<Customer, 'custom_price_monthly' | 'custom_price_6month' | 'custom_price_yearly'>
): boolean {
  return (
    customer.custom_price_monthly !== null ||
    customer.custom_price_6month !== null ||
    customer.custom_price_yearly !== null
  );
}

// Format price in dollars for display
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Calculate new expiry date based on billing period
export function calculateNewExpiry(
  currentExpiry: Date | null,
  period: BillingPeriod
): Date {
  const now = new Date();
  // If current expiry is in the future, extend from there; otherwise extend from now
  const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;

  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + PERIOD_DAYS[period]);

  return newExpiry;
}

// Get all pricing options for display
export function getPricingOptions(
  customer?: Pick<Customer, 'custom_price_monthly' | 'custom_price_6month' | 'custom_price_yearly' | 'plan_type'> | null
): Array<{ period: BillingPeriod; label: string; price: number; isCustom: boolean }> {
  const periods: BillingPeriod[] = ['monthly', '6month', 'yearly'];
  const planType = customer?.plan_type || 'standard';
  const basePrices = PLAN_PRICES[planType];

  return periods.map(period => {
    const basePrice = basePrices[period];
    const actualPrice = customer ? getCustomerPrice(customer, period) : basePrice;

    return {
      period,
      label: PERIOD_LABELS[period],
      price: actualPrice,
      isCustom: actualPrice !== basePrice,
    };
  });
}
