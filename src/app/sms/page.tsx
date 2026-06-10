import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OOUStream | SMS Messaging Terms & Opt-In",
  description:
    "How OOUStream uses SMS: one-time account login links only. Learn how to opt in, message frequency, rates, and how to opt out (STOP) or get help (HELP).",
  alternates: {
    canonical: "https://ooustream.com/sms",
  },
  openGraph: {
    title: "OOUStream | SMS Messaging Terms & Opt-In",
    description:
      "How OOUStream uses SMS: one-time account login links only. Opt-in, frequency, rates, STOP/HELP.",
    url: "https://ooustream.com/sms",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "OOUStream | SMS Messaging Terms & Opt-In",
    description:
      "How OOUStream uses SMS: one-time account login links only. Opt-in, frequency, rates, STOP/HELP.",
    images: ["/og-image.png"],
  },
};

export default function SmsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Simple header for public pages */}
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
          SMS Messaging Terms &amp; Opt-In
        </h1>
        <p className="text-gray-400 mb-8">
          OOUStream Account Login Texts — program details and consent
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            <strong>Effective Date:</strong> June 4, 2026
          </p>

          {/* Program */}
          <h2 className="text-xl font-semibold text-white mt-8">
            1. Program Description
          </h2>
          <p className="text-gray-300">
            OOUStream sends <strong>one-time account login (verification) links</strong> by
            SMS to customers who request access to their customer portal. These are
            transactional account-authentication messages. We do{" "}
            <strong>not</strong> send marketing or promotional text messages, and we do{" "}
            <strong>not</strong> send passwords or login credentials by SMS.
          </p>

          {/* How to opt in — the CTA */}
          <h2 className="text-xl font-semibold text-white mt-8">
            2. How You Opt In (Consent)
          </h2>
          <p className="text-gray-300">
            You opt in on our public login page at{" "}
            <a
              href="https://ooustream.com/login"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              ooustream.com/login
            </a>
            . On the &quot;Email / Phone&quot; tab, enter your mobile phone number to request a
            secure login link. The disclosure shown directly beneath the phone field reads:
          </p>
          <blockquote className="border-l-2 border-cyan-500/50 pl-4 text-gray-300 italic">
            &quot;If you enter a phone number, you agree to receive a one-time login text from
            OOUStream. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.&quot;
          </blockquote>
          <p className="text-gray-300">
            Entering your mobile number and submitting the request constitutes your consent to
            receive the one-time login text described above. Consent is not a condition of
            purchase.
          </p>

          {/* Sample */}
          <h2 className="text-xl font-semibold text-white mt-8">
            3. Sample Message
          </h2>
          <blockquote className="border-l-2 border-cyan-500/50 pl-4 text-gray-300 font-mono text-sm">
            OOUStream: your login link (expires in 15 min):
            https://ooustream.com/verify?token=XXXXXXXX Reply STOP to opt out, HELP for help.
          </blockquote>

          {/* Frequency & rates */}
          <h2 className="text-xl font-semibold text-white mt-8">
            4. Message Frequency &amp; Rates
          </h2>
          <p className="text-gray-300">
            You only receive a message when <strong>you</strong> request a login link, so
            frequency depends on how often you sign in. This is not a recurring or scheduled
            program. <strong>Message and data rates may apply.</strong>
          </p>

          {/* Opt out / help */}
          <h2 className="text-xl font-semibold text-white mt-8">
            5. Opt-Out &amp; Help
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <strong>Opt out:</strong> Reply <strong>STOP</strong> to any message at any time
              to stop receiving login texts. You will receive one confirmation message.
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
          <h2 className="text-xl font-semibold text-white mt-8">
            6. Privacy
          </h2>
          <p className="text-gray-300">
            We do <strong>not</strong> sell, rent, or share your phone number or opt-in data
            with third parties for marketing purposes. Your number is used only to deliver the
            login texts described above. See our{" "}
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
          <h2 className="text-xl font-semibold text-white mt-8">
            7. Contact
          </h2>
          <ul className="list-none text-gray-300 space-y-1">
            <li>Email: oouchie@ooustream.com</li>
            <li>Website: ooustream.com</li>
          </ul>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-[#1e293b] flex flex-wrap gap-6 text-sm text-gray-400">
          <Link href="/sms-alerts" className="hover:text-cyan-400 transition-colors">
            SMS Account Notifications
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
