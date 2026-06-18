import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About OOUStream | Premium IPTV Streaming Service",
  description:
    "Learn about OOUStream — a premium IPTV streaming subscription for live TV, sports, international channels, and on-demand content on every device, with real human support.",
  alternates: {
    canonical: "https://ooustream.com/about",
  },
  openGraph: {
    title: "About OOUStream | Premium IPTV Streaming Service",
    description:
      "Who we are and what OOUStream offers: live TV, sports, international channels, and on-demand content on any device, with real human support.",
    url: "https://ooustream.com/about",
    siteName: "OOUStream",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About OOUStream | Premium IPTV Streaming Service",
    description:
      "Live TV, sports, international channels, and on-demand content on any device, with real human support.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">About OOUStream</h1>
        <p className="text-gray-400 mb-8">
          Premium IPTV streaming for live TV, sports, international channels, and
          on-demand content &mdash; on every device you own.
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-gray-300">
            OOUStream is a premium internet television (IPTV) subscription
            service. We give households a simpler, more flexible alternative to
            traditional cable: thousands of live channels, on-demand movies and
            series, and international programming, all delivered over your
            internet connection and watchable on the devices you already own.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">What we offer</h2>
          <p className="text-gray-300">
            A single OOUStream subscription covers live TV across a wide range of
            categories &mdash; news, live sports, entertainment, kids and family,
            lifestyle, and international channels &mdash; plus a large on-demand
            library of movies and series. Everything streams in HD, with 4K
            available where the source supports it.
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>
              <strong>Thousands of live channels</strong> spanning news, sports,
              entertainment, and international content.
            </li>
            <li>
              <strong>On-demand movies and series</strong> you can start any time.
            </li>
            <li>
              <strong>Works on every device</strong> &mdash; Fire Stick, Android
              TV, smart TVs, Apple TV, Roku, phones, tablets, and computers.
            </li>
            <li>
              <strong>Multiple simultaneous streams</strong> so different people in
              the home can watch different things at once.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            Works on the devices you already have
          </h2>
          <p className="text-gray-300">
            You don&rsquo;t need special equipment or a long-term contract.
            OOUStream runs on Amazon Fire Stick and Fire TV, Android TV boxes,
            Samsung and LG smart TVs, Apple TV, Roku, Android phones and tablets,
            iPhone and iPad, and Windows or Mac computers. Our{" "}
            <Link href="/blog" className="text-cyan-400 underline hover:text-cyan-300">
              setup guides
            </Link>{" "}
            walk you through installation on each one, step by step.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Simple, honest pricing</h2>
          <p className="text-gray-300">
            We keep pricing straightforward, with no equipment rental and no
            hidden fees. The <strong>Standard</strong> plan covers 2 simultaneous
            connections, and the <strong>Pro</strong> plan covers 4 connections
            with multiview &mdash; available monthly, every 6 months, or yearly.
            You can see the full breakdown on our{" "}
            <Link href="/best-iptv-service" className="text-cyan-400 underline hover:text-cyan-300">
              service page
            </Link>
            , or try the service first with a{" "}
            <Link href="/trial" className="text-cyan-400 underline hover:text-cyan-300">
              free 24-hour trial
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Real human support</h2>
          <p className="text-gray-300">
            Streaming should be simple, but questions come up &mdash; getting set
            up on a new device, fixing buffering, or sorting out billing. Our
            support team answers real people, not scripts. You can reach us any
            time through our{" "}
            <Link href="/contact" className="text-cyan-400 underline hover:text-cyan-300">
              contact page
            </Link>{" "}
            or by opening a ticket from your account, and our{" "}
            <Link href="/help" className="text-cyan-400 underline hover:text-cyan-300">
              help center
            </Link>{" "}
            covers the most common setup and troubleshooting questions.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Who we are</h2>
          <p className="text-gray-300">
            OOUStream is built and operated by a small team that cares about a
            reliable picture and a fair price. We&rsquo;re based in Atlanta,
            Georgia, and we&rsquo;re focused on one thing: making premium
            streaming easy for everyday households. If you have a question before
            you sign up, we&rsquo;d love to hear from you &mdash; just{" "}
            <Link href="/contact" className="text-cyan-400 underline hover:text-cyan-300">
              get in touch
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e293b] flex flex-wrap gap-6 text-sm text-gray-400">
          <Link href="/best-iptv-service" className="hover:text-cyan-400 transition-colors">
            Our Service
          </Link>
          <Link href="/blog" className="hover:text-cyan-400 transition-colors">
            Blog &amp; Guides
          </Link>
          <Link href="/contact" className="hover:text-cyan-400 transition-colors">
            Contact
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
