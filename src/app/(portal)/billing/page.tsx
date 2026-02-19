'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, PERIOD_LABELS, PLAN_PRICES, PLAN_CONNECTIONS } from '@/lib/pricing';
import { BillingPeriod, PlanType } from '@/types';

interface CustomerBilling {
  service_type: string;
  status: string;
  expiry_date: string | null;
  billing_period: BillingPeriod;
  plan_type: PlanType;
  reseller: string | null;
  custom_price_monthly: number | null;
  custom_price_6month: number | null;
  custom_price_yearly: number | null;
}

export default function BillingPage() {
  const [customer, setCustomer] = useState<CustomerBilling | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, []);

  async function fetchCustomerData() {
    try {
      const res = await fetch('/api/customer/billing');
      if (!res.ok) throw new Error('Failed to load billing data');
      const data = await res.json();
      setCustomer(data);
      setSelectedPeriod(data.billing_period || 'monthly');
    } catch {
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }

  const planType: PlanType = customer?.plan_type || 'standard';
  const basePrices = PLAN_PRICES[planType];

  function getPrice(period: BillingPeriod): number {
    if (!customer) return basePrices[period];

    const customPrices: Record<BillingPeriod, number | null> = {
      monthly: customer.custom_price_monthly,
      '6month': customer.custom_price_6month,
      yearly: customer.custom_price_yearly,
    };

    return customPrices[period] ?? basePrices[period];
  }

  function hasDiscount(period: BillingPeriod): boolean {
    const price = getPrice(period);
    return price < basePrices[period];
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod: selectedPeriod }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">{error}</p>
      </div>
    );
  }

  // Reseller customers cannot pay through the portal
  if (customer?.reseller) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Billing</h1>
          <p className="text-[#94a3b8] mt-1">
            Manage your subscription and payments
          </p>
        </div>

        <div className="card text-center py-12">
          <div className="text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#f1f5f9] mb-2">
            Contact Your Reseller
          </h2>
          <p className="text-[#94a3b8] max-w-md mx-auto">
            Your account is managed by a reseller. Please contact them directly to make payments or renew your subscription.
          </p>
          <div className="mt-6">
            <Link
              href="/support/new"
              className="text-[#00d4ff] hover:underline text-sm"
            >
              Need help? Open a support ticket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = customer?.expiry_date
    ? Math.ceil((new Date(customer.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Billing</h1>
          <p className="text-[#94a3b8] mt-1">
            Manage your subscription and payments
          </p>
        </div>
        <Link
          href="/billing/history"
          className="text-[#00d4ff] hover:underline text-sm"
        >
          View Payment History
        </Link>
      </div>

      {/* Current Plan */}
      {customer && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8]">Current Plan</p>
              <p className="text-2xl font-bold text-[#f1f5f9] mt-1">
                {planType === 'pro' ? 'Pro' : 'Standard'}
              </p>
            </div>
            <span
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: planType === 'pro' ? 'rgba(124,58,237,0.15)' : 'rgba(0,212,255,0.15)',
                color: planType === 'pro' ? '#7c3aed' : '#00d4ff',
                border: `1px solid ${planType === 'pro' ? 'rgba(124,58,237,0.3)' : 'rgba(0,212,255,0.3)'}`,
              }}
            >
              {PLAN_CONNECTIONS[planType]} Connections
            </span>
          </div>
        </div>
      )}

      {/* Current Status */}
      {customer && (
        <div className={`card ${
          isExpired
            ? 'bg-[#ef4444]/10 border-[#ef4444]/30'
            : isExpiringSoon
              ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30'
              : 'bg-[#22c55e]/10 border-[#22c55e]/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8]">Current Status</p>
              <p className="text-2xl font-bold text-[#f1f5f9] mt-1">
                {isExpired ? 'Expired' : customer.status}
              </p>
              {customer.expiry_date && (
                <p className="text-sm text-[#94a3b8] mt-2">
                  {isExpired
                    ? `Expired on ${new Date(customer.expiry_date).toLocaleDateString()}`
                    : `Expires on ${new Date(customer.expiry_date).toLocaleDateString()} (${daysRemaining} days remaining)`
                  }
                </p>
              )}
            </div>
            <div className={`text-4xl font-bold ${
              isExpired ? 'text-[#ef4444]' : isExpiringSoon ? 'text-[#f59e0b]' : 'text-[#22c55e]'
            }`}>
              {daysRemaining !== null ? (isExpired ? '!' : daysRemaining) : '—'}
              {!isExpired && daysRemaining !== null && (
                <span className="text-sm font-normal text-[#94a3b8] ml-1">days</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-6">
          Select Renewal Period
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(['monthly', '6month', 'yearly'] as BillingPeriod[]).map((period) => {
            const price = getPrice(period);
            const isSelected = selectedPeriod === period;
            const discount = hasDiscount(period);

            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                    : 'border-[#334155] hover:border-[#475569]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#f1f5f9] font-medium">
                    {PERIOD_LABELS[period]}
                  </span>
                  {discount && (
                    <span className="text-xs bg-[#22c55e] text-white px-2 py-0.5 rounded">
                      Special Price
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-[#00d4ff]">
                  {formatPrice(price)}
                </p>
                {discount && (
                  <p className="text-sm text-[#94a3b8] line-through">
                    {formatPrice(basePrices[period])}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Redirecting to Checkout...
            </span>
          ) : (
            `Pay ${formatPrice(getPrice(selectedPeriod))} Now`
          )}
        </button>

        <p className="text-xs text-[#94a3b8] text-center mt-4">
          Secure payment powered by Stripe. Your subscription will be extended immediately after payment.
        </p>
      </div>

      {/* Payment Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
          Payment Information
        </h2>
        <div className="space-y-3 text-sm text-[#94a3b8]">
          <p>
            <span className="text-[#f1f5f9]">Accepted:</span> All major credit/debit cards, Apple Pay, Google Pay
          </p>
          <p>
            <span className="text-[#f1f5f9]">Processing:</span> Instant activation after successful payment
          </p>
          <p>
            <span className="text-[#f1f5f9]">Questions?</span>{' '}
            <Link href="/support/new" className="text-[#00d4ff] hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
