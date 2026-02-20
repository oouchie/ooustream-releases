import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { MetaPixelEvent } from './MetaPixelEvent';

export default async function BillingSuccessPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const supabase = createServerClient();

  // Get updated customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('expiry_date, status')
    .eq('id', session.customerId)
    .single();

  // Get the most recent successful payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', session.customerId)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="max-w-lg mx-auto py-12 animate-fadeIn">
      <MetaPixelEvent
        event="CompleteRegistration"
        data={{
          currency: "USD",
          value: payment ? payment.amount / 100 : undefined,
        }}
      />
      <div className="card text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#22c55e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">
          Payment Successful!
        </h1>

        <p className="text-[#94a3b8] mb-6">
          Thank you for your payment. Your subscription has been renewed.
        </p>

        {/* Payment Details */}
        <div className="bg-[#0f172a] rounded-lg p-4 mb-6 text-left">
          <div className="space-y-3">
            {payment && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Amount Paid</span>
                  <span className="text-[#f1f5f9] font-medium">
                    ${(payment.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Period</span>
                  <span className="text-[#f1f5f9] font-medium">
                    {payment.billing_period === '6month'
                      ? '6 Months'
                      : payment.billing_period === 'yearly'
                        ? '1 Year'
                        : '1 Month'}
                  </span>
                </div>
              </>
            )}
            {customer?.expiry_date && (
              <div className="flex justify-between border-t border-[#334155] pt-3">
                <span className="text-[#94a3b8]">New Expiry Date</span>
                <span className="text-[#22c55e] font-medium">
                  {new Date(customer.expiry_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/" className="btn btn-primary w-full">
            Go to Dashboard
          </Link>
          <Link
            href="/billing/history"
            className="btn btn-secondary w-full"
          >
            View Payment History
          </Link>
        </div>

        <p className="text-xs text-[#94a3b8] mt-4">
          A receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
}
