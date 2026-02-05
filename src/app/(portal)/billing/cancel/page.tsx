import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="max-w-lg mx-auto py-12 animate-fadeIn">
      <div className="card text-center">
        {/* Cancel Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#f59e0b]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">
          Payment Cancelled
        </h1>

        <p className="text-[#94a3b8] mb-6">
          Your payment was not completed. No charges were made to your account.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/billing" className="btn btn-primary w-full">
            Try Again
          </Link>
          <Link href="/" className="btn btn-secondary w-full">
            Back to Dashboard
          </Link>
        </div>

        <p className="text-xs text-[#94a3b8] mt-6">
          Having trouble? <Link href="/support/new" className="text-[#00d4ff] hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
