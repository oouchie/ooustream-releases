import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OOUStream | SMS Account Notifications",
  description:
    "How OOUStream's account-notification SMS program works: renewal & payment reminders, service notifications, and account updates for existing customers. Opt-in, message frequency, rates, STOP/HELP.",
  alternates: {
    canonical: "https://ooustream.com/sms-alerts",
  },
  openGraph: {
    title: "OOUStream | SMS Account Notifications",
    description:
      "Account-notification SMS: renewal & payment reminders, service notifications, account updates. Opt-in, frequency, rates, STOP/HELP.",
    url: "https://ooustream.com/sms-alerts",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | SMS Account Notifications",
    description:
      "Account-notification SMS: renewal & payment reminders, service notifications, account updates. Opt-in, frequency, rates, STOP/HELP.",
    images: ["/og-image.png"],
  },
};

export default function SmsAlertsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#1e293b] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo-full-on-dark.png"
              alt="OOUStream"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/login"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Customer Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">
          SMS Account Notifications
        </h1>
        <p className="text-gray-400 mb-8">
          OOUStream Account Notification Texts — renewal &amp; payment reminders,
          service notifications, and account updates
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            <strong>Effective Date:</strong> June 9, 2026
          </p>

          <p className="text-gray-300">
            This program is separate from our one-time login link texts. For login
            (verification) texts, see our{" "}
            <Link href="/sms" className="text-cyan-400 underline hover:text-cyan-300">
              SMS Login Terms
            </Link>
            .
          </p>

          {/* Program */}
          <h2 className="text-xl font-semibold text-white mt-8">
            1. Program Description
          </h2>
          <p className="text-gray-300">
            OOUStream sends <strong>account notification</strong> text messages to
            existing customers who opt in. These transactional, account-related messages
            are limited to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <strong>Renewal &amp; expiry reminders</strong> — a reminder before your
              subscription expires so your service does not lapse.
            </li>
            <li>
              <strong>Payment reminders &amp; receipts</strong> — upcoming or overdue
              payment reminders, failed-payment notices, and payment confirmations.
            </li>
            <li>
              <strong>Service notifications</strong> — outages, scheduled maintenance,
              and service-status updates.
            </li>
            <li>
              <strong>Account updates</strong> — status or plan changes, notices that
              account information is ready to view in your portal, and support-ticket
              updates.
            </li>
          </ul>
          <p className="text-gray-300">
            We do <strong>not</strong> send marketing or promotional texts under this
            program, and we <strong>never</strong> send passwords or login credentials by
            SMS.
          </p>

          {/* How to opt in — the CTA */}
          <h2 className="text-xl font-semibold text-white mt-8">
            2. How You Opt In (Consent)
          </h2>
          <p className="text-gray-300">
            Opt in is <strong>self-service</strong> from your customer portal. After you
            log in, open your{" "}
            <Link href="/dashboard" className="text-cyan-400 underline hover:text-cyan-300">
              Dashboard
            </Link>{" "}
            and turn on the <em>&quot;Text me account updates&quot;</em> toggle. The
            disclosure shown next to the toggle reads:
          </p>
          <blockquote className="border-l-2 border-cyan-500/50 pl-4 text-gray-300 italic">
            &quot;Get account texts from OOUStream — renewal &amp; payment reminders,
            service notifications (outages, maintenance), and account updates. Message
            frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP
            for help. Consent is not a condition of purchase.&quot;
          </blockquote>
          <p className="text-gray-300">
            Turning the toggle on constitutes your express consent to receive the account
            notification texts described above at the mobile number on your account.
            Consent is not a condition of purchase.
          </p>

          {/* Sample */}
          <h2 className="text-xl font-semibold text-white mt-8">3. Sample Messages</h2>
          <blockquote className="border-l-2 border-cyan-500/50 pl-4 text-gray-300 font-mono text-sm space-y-3">
            <p>
              OOUStream: your subscription expires on Jun 30. Manage your account:
              https://ooustream.com/billing Reply STOP to opt out, HELP for help.
            </p>
            <p>
              OOUStream: we were unable to process your recent payment. View details in
              your account: https://ooustream.com/billing Reply STOP to opt out, HELP for
              help.
            </p>
            <p>
              OOUStream: scheduled maintenance tonight 1-3am ET may briefly affect
              streaming. Reply STOP to opt out, HELP for help.
            </p>
            <p>
              OOUStream: your support ticket #1234 has been updated. View it:
              https://ooustream.com/support Reply STOP to opt out, HELP for help.
            </p>
          </blockquote>

          {/* Frequency & rates */}
          <h2 className="text-xl font-semibold text-white mt-8">
            4. Message Frequency &amp; Rates
          </h2>
          <p className="text-gray-300">
            Message frequency varies by your account activity (for example, renewal
            reminders around 7 days and 1 day before expiry, payment reminders tied to
            your billing, and occasional service notifications).{" "}
            <strong>Message and data rates may apply.</strong>
          </p>

          {/* Opt out / help */}
          <h2 className="text-xl font-semibold text-white mt-8">5. Opt-Out &amp; Help</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <strong>Opt out:</strong> Reply <strong>STOP</strong> to any message at any
              time, or turn off the toggle in your portal Dashboard. You will receive one
              confirmation message.
            </li>
            <li>
              <strong>Help:</strong> Reply <strong>HELP</strong>, or email{" "}
              <a
                href="mailto:oouchie@ooustream.com"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                oouchie@ooustream.com
              </a>
              .
            </li>
          </ul>

          {/* Privacy */}
          <h2 className="text-xl font-semibold text-white mt-8">6. Privacy</h2>
          <p className="text-gray-300">
            We do <strong>not</strong> sell, rent, or share your phone number or opt-in
            data with third parties for marketing purposes. Your number is used only to
            deliver the account notification texts described above. See our{" "}
            <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-cyan-400 underline hover:text-cyan-300">
              Terms of Service
            </Link>
            .
          </p>

          {/* Contact */}
          <h2 className="text-xl font-semibold text-white mt-8">7. Contact</h2>
          <ul className="list-none text-gray-300 space-y-1">
            <li>Email: oouchie@ooustream.com</li>
            <li>Website: ooustream.com</li>
          </ul>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e293b] flex gap-6 text-sm text-gray-400">
          <Link href="/sms" className="hover:text-cyan-400 transition-colors">
            SMS Login Terms
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/login" className="hover:text-cyan-400 transition-colors">
            Customer Login
          </Link>
        </div>
      </main>
    </div>
  );
}
