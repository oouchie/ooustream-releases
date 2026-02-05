'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Payment } from '@/types';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const res = await fetch('/api/payments/history');
      if (!res.ok) throw new Error('Failed to load payment history');
      const data = await res.json();
      setPayments(data.payments);
    } catch {
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    succeeded: 'text-[#22c55e] bg-[#22c55e]/10',
    pending: 'text-[#f59e0b] bg-[#f59e0b]/10',
    processing: 'text-[#00d4ff] bg-[#00d4ff]/10',
    failed: 'text-[#ef4444] bg-[#ef4444]/10',
    refunded: 'text-[#94a3b8] bg-[#94a3b8]/10',
  };

  const periodLabels: Record<string, string> = {
    monthly: '1 Month',
    '6month': '6 Months',
    yearly: '1 Year',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Payment History</h1>
          <p className="text-[#94a3b8] mt-1">
            View your past payments and transactions
          </p>
        </div>
        <Link href="/billing" className="btn btn-secondary">
          Back to Billing
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444]">
          {error}
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#334155] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#94a3b8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-[#94a3b8]">No payment history yet</p>
          <Link href="/billing" className="btn btn-primary mt-4">
            Make a Payment
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left text-sm font-medium text-[#94a3b8] p-4">
                    Date
                  </th>
                  <th className="text-left text-sm font-medium text-[#94a3b8] p-4">
                    Period
                  </th>
                  <th className="text-left text-sm font-medium text-[#94a3b8] p-4">
                    Amount
                  </th>
                  <th className="text-left text-sm font-medium text-[#94a3b8] p-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-[#334155] last:border-0"
                  >
                    <td className="p-4 text-[#f1f5f9]">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-[#f1f5f9]">
                      {periodLabels[payment.billing_period] || payment.billing_period}
                    </td>
                    <td className="p-4 text-[#f1f5f9] font-medium">
                      ${(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          statusColors[payment.status] || 'text-[#94a3b8] bg-[#334155]'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
