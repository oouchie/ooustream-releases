import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact OOUStream | Support & Help",
  description:
    "Get in touch with OOUStream. Email our support team, open a ticket from your account, or browse setup and troubleshooting guides. We're here to help.",
  alternates: {
    canonical: "https://ooustream.com/contact",
  },
  openGraph: {
    title: "Contact OOUStream | Support & Help",
    description:
      "Email our support team, open a ticket, or browse setup and troubleshooting guides.",
    url: "https://ooustream.com/contact",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact OOUStream | Support & Help",
    description:
      "Email our support team, open a ticket, or browse setup and troubleshooting guides.",
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Contact OOUStream</h1>
        <p className="text-gray-400 mb-8">
          Questions before you sign up, or need a hand with your account?
          Here&rsquo;s how to reach us.
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <h2 className="text-xl font-semibold text-white mt-2">Email us</h2>
          <p className="text-gray-300">
            The fastest way to reach a real person is by email. Send us your
            question &mdash; including your device type and what you&rsquo;re
            seeing on screen &mdash; and we&rsquo;ll get back to you.
          </p>
          <p className="text-gray-300">
            <strong>Support email:</strong>{" "}
            <a
              href="mailto:oouchie@ooustream.com"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              oouchie@ooustream.com
            </a>
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Open a support ticket
          </h2>
          <p className="text-gray-300">
            If you&rsquo;re already a customer, the best way to track a question
            is from inside your account. After you{" "}
            <Link href="/login" className="text-cyan-400 underline hover:text-cyan-300">
              log in
            </Link>
            , you can{" "}
            <Link href="/support/new" className="text-cyan-400 underline hover:text-cyan-300">
              open a new support ticket
            </Link>{" "}
            and our team will reply there. You&rsquo;ll also find your account
            details and credentials on your{" "}
            <Link href="/credentials" className="text-cyan-400 underline hover:text-cyan-300">
              credentials page
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Response times</h2>
          <p className="text-gray-300">
            We aim to answer every message within <strong>24 hours</strong>, and
            usually much sooner during the day. Billing and account questions are
            typically resolved the same day.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Try the help center first
          </h2>
          <p className="text-gray-300">
            Many questions have a quick answer. Our{" "}
            <Link href="/help" className="text-cyan-400 underline hover:text-cyan-300">
              help center
            </Link>{" "}
            and{" "}
            <Link href="/blog" className="text-cyan-400 underline hover:text-cyan-300">
              setup &amp; troubleshooting guides
            </Link>{" "}
            cover installing OOUStream on every device, fixing buffering, and
            sorting out the TV guide (EPG). A few of the most-used guides:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <Link
                href="/blog/how-to-set-up-iptv-fire-stick"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                How to set up IPTV on a Fire Stick
              </Link>
            </li>
            <li>
              <Link
                href="/blog/why-is-my-iptv-buffering"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                Why is my IPTV buffering? 9 fixes
              </Link>
            </li>
            <li>
              <Link
                href="/blog/iptv-app-wont-load-troubleshooting"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                IPTV app won&rsquo;t load? Troubleshooting checklist
              </Link>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">New here?</h2>
          <p className="text-gray-300">
            Want to try OOUStream before subscribing? Start a{" "}
            <Link href="/trial" className="text-cyan-400 underline hover:text-cyan-300">
              free 24-hour trial
            </Link>
            , or read more{" "}
            <Link href="/about" className="text-cyan-400 underline hover:text-cyan-300">
              about who we are
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e293b] flex flex-wrap gap-6 text-sm text-gray-400">
          <Link href="/about" className="hover:text-cyan-400 transition-colors">
            About
          </Link>
          <Link href="/help" className="hover:text-cyan-400 transition-colors">
            Help Center
          </Link>
          <Link href="/blog" className="hover:text-cyan-400 transition-colors">
            Blog &amp; Guides
          </Link>
          <Link href="/trial" className="hover:text-cyan-400 transition-colors">
            Free Trial
          </Link>
        </div>

        <div className="mt-8 text-xs text-[#64748b]">
          <a
            href="https://1865freemoney.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00d4ff] transition-colors"
          >
            Powered by 1865 Free Money
          </a>
          <span className="block mt-0.5">Digital Excellence · Atlanta, GA</span>
        </div>
      </main>
    </div>
  );
}
