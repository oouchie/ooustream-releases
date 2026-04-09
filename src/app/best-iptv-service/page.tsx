"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, MotionReveal, MotionStagger, MotionStaggerChild } from "@/components/motion";

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is the best IPTV service in 2026?",
    a: "The best IPTV service depends on your needs, but OOUStream consistently ranks among the top choices for 2026. With 10,000+ live channels, HD and 4K streaming, a massive VOD library, and 24/7 AI-powered support, it delivers the reliability and content variety that most viewers are looking for — all at a fraction of the cost of cable TV.",
  },
  {
    q: "Is IPTV legal and safe to use?",
    a: "IPTV technology itself is completely legal. It is simply a method of delivering television content over the internet, used by major providers like YouTube TV, Hulu Live, and Sling TV. The legality depends on the provider and their content licensing. Always choose a reputable IPTV provider with transparent business practices and responsive customer support.",
  },
  {
    q: "What devices are compatible with IPTV?",
    a: "IPTV works on virtually every modern device. This includes Amazon Fire Stick and Fire TV, Android TV boxes, Samsung and LG Smart TVs, iPhones and iPads, Android phones and tablets, Windows and Mac computers, and Roku devices. OOUStream supports all of these with dedicated apps and setup guides for each platform.",
  },
  {
    q: "What internet speed do I need for IPTV streaming?",
    a: "For standard definition (SD) streaming, 5 Mbps is sufficient. HD streaming requires 15 to 25 Mbps. For the best 4K streaming experience, we recommend at least 50 Mbps. A wired ethernet connection will always provide the most stable performance compared to Wi-Fi.",
  },
  {
    q: "Can I use IPTV on multiple devices at the same time?",
    a: "Yes. OOUStream's Standard plan supports 2 simultaneous connections, while the Pro plan supports 4 connections with multiview capability. This means different people in your household can watch different channels on different devices at the same time without any interruption.",
  },
  {
    q: "Is IPTV better than cable TV?",
    a: "For most viewers, IPTV offers significant advantages over cable TV: lower monthly cost (starting at $15 per month compared to $100+ for cable), far more channels (10,000+ versus a few hundred), on-demand content libraries, the ability to watch on any device from anywhere, no long-term contracts, and higher streaming quality including 4K.",
  },
  {
    q: "Why does IPTV buffer and how do I fix it?",
    a: "IPTV buffering is typically caused by slow internet speeds, Wi-Fi interference, an overloaded router, or low-quality servers from the provider. You can fix it by using a wired ethernet connection, restarting your router, closing background apps on your device, or choosing a provider like OOUStream that uses anti-buffering technology and high-capacity servers.",
  },
  {
    q: "Does OOUStream offer a free trial?",
    a: "Yes, OOUStream offers a free trial so you can test the full service before committing to a subscription. You can request a trial directly on the OOUStream website by filling out the trial request form. No credit card is required to get started.",
  },
  {
    q: "How do I set up IPTV on my Amazon Fire Stick?",
    a: "Setting up IPTV on a Fire Stick takes under 5 minutes. Download the OOUStream app or a compatible IPTV player from the Amazon Appstore, enter your subscription credentials, and start streaming. OOUStream provides step-by-step video tutorials covering setup on every supported device.",
  },
  {
    q: "What is included in an OOUStream IPTV subscription?",
    a: "Every OOUStream subscription includes 10,000+ live TV channels from around the world, a full library of movies and TV shows on demand, live sports and PPV events, an Electronic Program Guide (EPG), HD and 4K streaming quality, multi-device support, and access to 24/7 AI-powered customer support.",
  },
];

// ─── Comparison Data ─────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: "Live Channels", ooustream: "10,000+", typical: "500–2,000", cable: "200–300" },
  { feature: "Streaming Quality", ooustream: "HD & 4K", typical: "HD only", cable: "HD (some 4K)" },
  { feature: "VOD Library", ooustream: "Full library", typical: "Limited", cable: "Pay-per-view" },
  { feature: "Live Sports & PPV", ooustream: "Included", typical: "Some included", cable: "Extra cost" },
  { feature: "Device Support", ooustream: "All devices", typical: "Limited", cable: "TV box only" },
  { feature: "Simultaneous Streams", ooustream: "2–4", typical: "1–2", cable: "1 per box" },
  { feature: "EPG (TV Guide)", ooustream: "Full EPG", typical: "Basic or none", cable: "Full EPG" },
  { feature: "Customer Support", ooustream: "24/7 AI + Human", typical: "Email only", cable: "Phone (long wait)" },
  { feature: "Monthly Cost", ooustream: "From $15/mo", typical: "$10–25/mo", cable: "$100+/mo" },
  { feature: "Contract Required", ooustream: "No", typical: "No", cable: "Yes (1–2 years)" },
  { feature: "Free Trial", ooustream: "Yes", typical: "Sometimes", cable: "No" },
];

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(18,18,26,0.8)",
            border: "1px solid #2a2a3a",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#1a1a24]"
            aria-expanded={open === i}
          >
            <span className="text-[#f1f5f9] font-medium pr-4">{item.q}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5 flex-shrink-0 text-[#00d4ff] transition-transform duration-300"
              style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: open === i ? "500px" : "0px",
              opacity: open === i ? 1 : 0,
            }}
          >
            <p className="px-6 pb-5 text-[#94a3b8] leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BestIPTVServicePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: "Best IPTV Service in 2026: Stream 10,000+ Channels in HD & 4K",
                author: { "@type": "Organization", name: "OOUStream" },
                publisher: {
                  "@type": "Organization",
                  name: "OOUStream",
                  logo: { "@type": "ImageObject", url: "https://ooustream.com/logo-full-on-dark.png" },
                },
                datePublished: "2026-04-09",
                dateModified: "2026-04-09",
                description:
                  "Compare the best IPTV services in 2026. See why OOUStream delivers 10,000+ live channels in HD & 4K with no buffering on every device.",
                mainEntityOfPage: "https://ooustream.com/best-iptv-service",
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQ_ITEMS.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://ooustream.com" },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Best IPTV Service",
                    item: "https://ooustream.com/best-iptv-service",
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-iptv.png" alt="OOUStream" width={160} height={52} className="h-[52px] w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#pricing"
              className="hidden sm:inline-block text-sm text-[#94a3b8] hover:text-[#00d4ff] transition-colors"
            >
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Customer Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className="max-w-4xl mx-auto px-4 pt-6 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs text-[#64748b]">
          <li>
            <Link href="/" className="hover:text-[#00d4ff] transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#94a3b8]">Best IPTV Service</li>
        </ol>
      </nav>

      {/* ── Hero / Intro ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <p className="text-xs font-mono uppercase tracking-widest text-[#00d4ff] mb-4">
              Updated April 2026
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-6 leading-tight">
              Best IPTV Service in 2026: Stream 10,000+ Channels in HD &amp; 4K
            </h1>
            <p className="text-lg text-[#94a3b8] leading-relaxed mb-6">
              Looking for the <strong className="text-[#f1f5f9]">best IPTV service</strong> to replace your expensive cable subscription? You&apos;re not alone. Millions of viewers across the United States are cutting the cord and switching to IPTV streaming services that deliver more channels, better quality, and lower prices than traditional cable TV. In this comprehensive guide, we compare the top IPTV providers in 2026, break down what makes a great IPTV service, and show you why{" "}
              <Link href="/" className="text-[#00d4ff] hover:underline">
                OOUStream
              </Link>{" "}
              has become one of the most trusted names in premium IPTV streaming.
            </p>
            <p className="text-[#94a3b8] leading-relaxed">
              Whether you want live sports without the blackouts, thousands of international channels, or a massive library of movies and shows on demand — this guide will help you find the right IPTV provider for your household. We cover everything from pricing and device compatibility to setup instructions and troubleshooting tips.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ── What Is IPTV ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-6">
              What Is IPTV and Why Is Everyone Cutting the Cord?
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-5">
              IPTV stands for <strong className="text-[#f1f5f9]">Internet Protocol Television</strong> — a technology that delivers TV channels and video content over the internet instead of through traditional cable lines or satellite signals. Unlike conventional TV, IPTV lets you stream live television, movies, and on-demand content directly to any internet-connected device, from your living room TV to your phone on the go.
            </p>
            <p className="text-[#94a3b8] leading-relaxed mb-5">
              The shift from cable to IPTV has accelerated dramatically in recent years, and the reasons are clear. The average American cable bill now exceeds $100 per month for a limited selection of channels, locked into a rigid schedule with long-term contracts. IPTV streaming services offer a fundamentally different proposition: thousands of channels, on-demand flexibility, and monthly costs starting as low as $15 — with no contracts and no commitments.
            </p>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              IPTV works by packaging content into IP packets that are streamed in real time to your device. When you select a channel or on-demand title, the IPTV provider routes the content through their servers directly to your screen. Modern IPTV services use advanced CDN (Content Delivery Network) infrastructure and anti-buffering technology to ensure smooth, uninterrupted playback — even during peak viewing hours like Sunday night football or pay-per-view events.
            </p>
          </MotionReveal>

          <MotionReveal>
            <div
              className="rounded-xl p-6 md:p-8"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <h3 className="text-xl font-semibold text-[#f1f5f9] mb-4">IPTV vs Cable TV: The Real Cost Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider text-[#ef4444] mb-2">Cable TV</p>
                  <ul className="space-y-2 text-[#94a3b8] text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-0.5">&#x2717;</span>
                      $100–$200+ per month
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-0.5">&#x2717;</span>
                      200–300 channels (mostly filler)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-0.5">&#x2717;</span>
                      1–2 year contract required
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-0.5">&#x2717;</span>
                      Equipment rental fees ($10–15/mo per box)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ef4444] mt-0.5">&#x2717;</span>
                      Watch only on your home TV
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider text-[#22c55e] mb-2">OOUStream IPTV</p>
                  <ul className="space-y-2 text-[#94a3b8] text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">&#x2713;</span>
                      From $15 per month
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">&#x2713;</span>
                      10,000+ live channels
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">&#x2713;</span>
                      No contracts — cancel anytime
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">&#x2713;</span>
                      No equipment needed — use your own devices
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">&#x2713;</span>
                      Watch anywhere on any device
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* ── What Makes a Great IPTV Service ─────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              What Makes a Great IPTV Service in 2026
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Not all IPTV providers are created equal. After evaluating dozens of services, these are the seven factors that separate the best IPTV providers from the ones that will leave you frustrated with buffering, missing channels, and zero support when something goes wrong.
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Channel Count & Variety",
                desc: "The best IPTV services offer 10,000+ channels spanning live TV, international programming, news, entertainment, kids content, and niche categories. Fewer than 1,000 channels is a red flag.",
                icon: "M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z",
              },
              {
                title: "HD & 4K Streaming Quality",
                desc: "In 2026, anything less than HD is unacceptable. Top IPTV providers offer full HD (1080p) as standard with 4K available on popular channels. Ask about resolution before subscribing.",
                icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5",
              },
              {
                title: "Multi-Device Compatibility",
                desc: "Your IPTV service should work on every screen in your home: Fire Stick, Smart TVs, phones, tablets, computers, and Android boxes. If it only works on one or two platforms, keep looking.",
                icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
              },
              {
                title: "Electronic Program Guide (EPG)",
                desc: "A proper EPG lets you browse what's on now, what's coming up, and schedule your viewing. It's the difference between a professional IPTV service and a bare-bones channel list.",
                icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
              },
              {
                title: "VOD Library",
                desc: "Beyond live TV, the best IPTV providers include a massive library of movies and TV series on demand. Look for services that regularly update their VOD catalog with new releases.",
                icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125",
              },
              {
                title: "Reliable Customer Support",
                desc: "When your stream drops during the big game, you need help immediately — not a 48-hour email response. Look for 24/7 support with fast response times. AI-powered support is a growing advantage.",
                icon: "M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
              },
              {
                title: "Transparent Pricing",
                desc: "Avoid providers with hidden fees or unclear billing. The best IPTV services show their prices upfront with flexible billing periods (monthly, 6-month, yearly) and no long-term contracts.",
                icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
              },
            ].map((item, i) => (
              <MotionStaggerChild key={i}>
                <div
                  className="rounded-xl p-5 h-full transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(18,18,26,0.8)",
                    border: "1px solid #2a2a3a",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(0,212,255,0.1)" }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={1.5} className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[#f1f5f9] font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>

          <MotionReveal>
            <div className="mt-10 rounded-xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-3">Red Flags to Watch For</h3>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-0.5">&#x26A0;</span>
                  Prices that seem too good to be true (under $5/month usually means unreliable servers)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-0.5">&#x26A0;</span>
                  No customer support or email-only support with slow response times
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-0.5">&#x26A0;</span>
                  No free trial offered — reputable providers let you test before you buy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-0.5">&#x26A0;</span>
                  Cryptocurrency-only payments with no standard payment options
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-0.5">&#x26A0;</span>
                  No website, no social media presence, and no way to verify the business
                </li>
              </ul>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* ── OOUStream Section ───────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <span
              className="inline-block text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              Featured Provider
            </span>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              OOUStream: Built for Reliability from Day One
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              OOUStream was built with a simple philosophy: deliver the IPTV streaming experience that viewers actually want — reliable streams, massive content, fair prices, and support that&apos;s there when you need it. Here&apos;s what sets OOUStream apart as one of the best IPTV providers in 2026.
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "10,000+ Live Channels",
                desc: "Stream live television from around the world. US networks, international channels, news, entertainment, kids programming, music channels, and specialty content — all available in one place. No cable package comes close to this selection.",
                color: "#00d4ff",
              },
              {
                title: "HD & 4K Streaming Quality",
                desc: "Every channel streams in HD as standard, with 4K available on popular channels. OOUStream uses high-capacity servers and anti-buffering technology to deliver smooth, crystal-clear playback — even during peak hours and major live events.",
                color: "#7c3aed",
              },
              {
                title: "Movies, Shows & Sports On Demand",
                desc: "Beyond live TV, access a full library of movies, TV series, and sports replays on demand. New content is added regularly. Live sports and PPV events are included in every subscription — no extra charges for the big fights or championship games.",
                color: "#22c55e",
              },
              {
                title: "24/7 AI-Powered Support",
                desc: "OOUStream is one of the few IPTV providers offering AI-powered customer support available around the clock. Get instant answers to setup questions, troubleshooting help, and account assistance without waiting in a queue. Human support is available when you need it too.",
                color: "#fbbf24",
              },
            ].map((item, i) => (
              <MotionStaggerChild key={i}>
                <div
                  className="rounded-xl p-6 h-full transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(18,18,26,0.8)",
                    border: `1px solid ${item.color}22`,
                    boxShadow: `0 0 20px ${item.color}08`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mb-4"
                    style={{ background: item.color, boxShadow: `0 0 10px ${item.color}60` }}
                  />
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-3">{item.title}</h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-5xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              How OOUStream Compares to Other IPTV Providers
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              When choosing the best IPTV service, it helps to see how providers stack up side by side. Here&apos;s how OOUStream compares to typical IPTV providers and traditional cable TV across the features that matter most.
            </p>
          </MotionReveal>

          <MotionReveal>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #2a2a3a" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(0,212,255,0.08)" }}>
                    <th className="text-left px-5 py-4 text-[#94a3b8] font-medium">Feature</th>
                    <th className="text-left px-5 py-4 text-[#00d4ff] font-semibold">OOUStream</th>
                    <th className="text-left px-5 py-4 text-[#94a3b8] font-medium">Typical IPTV</th>
                    <th className="text-left px-5 py-4 text-[#94a3b8] font-medium">Cable TV</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? "rgba(18,18,26,0.6)" : "rgba(18,18,26,0.3)",
                        borderTop: "1px solid #1e1e2a",
                      }}
                    >
                      <td className="px-5 py-3.5 text-[#f1f5f9] font-medium">{row.feature}</td>
                      <td className="px-5 py-3.5 text-[#00d4ff]">{row.ooustream}</td>
                      <td className="px-5 py-3.5 text-[#94a3b8]">{row.typical}</td>
                      <td className="px-5 py-3.5 text-[#94a3b8]">{row.cable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* ── Compatible Devices ───────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              Compatible Devices: Watch IPTV on Every Screen
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              One of the biggest advantages of IPTV over cable TV is device flexibility. You&apos;re not tied to a cable box in your living room. OOUStream works on every major platform and device, so you can watch live TV and on-demand content wherever you are.
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Amazon Fire Stick & Fire TV", desc: "The most popular IPTV device. Easy setup, affordable, and powerful enough for HD and 4K streaming." },
              { name: "Android TV & Boxes", desc: "Nvidia Shield, Xiaomi Mi Box, and other Android TV devices. Full Google Play Store access for IPTV apps." },
              { name: "Samsung & LG Smart TVs", desc: "Stream directly on your Smart TV without any additional hardware. Native app support available." },
              { name: "iPhone & iPad", desc: "Watch live TV and on-demand content on the go. Download the app from the App Store for instant access." },
              { name: "Android Phones & Tablets", desc: "Full IPTV experience on any Android device. Compatible with popular IPTV player apps." },
              { name: "Windows & Mac Computers", desc: "Stream on your desktop or laptop through web-based players or dedicated desktop applications." },
            ].map((device, i) => (
              <MotionStaggerChild key={i}>
                <div
                  className="rounded-xl p-5 h-full"
                  style={{ background: "rgba(18,18,26,0.8)", border: "1px solid #2a2a3a" }}
                >
                  <h3 className="text-[#f1f5f9] font-semibold mb-2">{device.name}</h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{device.desc}</p>
                </div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              IPTV Subscription Pricing That Makes Cable Look Expensive
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              OOUStream offers flexible pricing with no contracts and no hidden fees. Choose between two plans depending on how many simultaneous connections you need, and pick the billing period that works best for your budget. Every plan includes full access to all 10,000+ channels, the complete VOD library, and 24/7 support.
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Plan */}
            <MotionStaggerChild>
              <div className="rounded-xl p-6" style={{ background: "rgba(18,18,26,0.8)", border: "1px solid #2a2a3a" }}>
                <h3 className="text-xl font-bold text-[#f1f5f9] mb-1">Standard Plan</h3>
                <p className="text-sm text-[#94a3b8] mb-5">Up to 2 connections</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[#94a3b8] text-sm">1 Month</span>
                    <span className="text-[#f1f5f9] font-semibold">$20/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                    <span className="text-[#94a3b8] text-sm">6 Months</span>
                    <div className="text-right">
                      <span className="text-[#f1f5f9] font-semibold">$90</span>
                      <span className="text-xs text-[#00d4ff] ml-2">$15/mo</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[#94a3b8] text-sm">1 Year</span>
                    <div className="text-right">
                      <span className="text-[#f1f5f9] font-semibold">$170</span>
                      <span className="text-xs text-[#22c55e] ml-2">$14.17/mo</span>
                    </div>
                  </div>
                </div>
                <Link href="/#pricing" className="btn btn-secondary w-full justify-center text-sm">
                  View Plans
                </Link>
              </div>
            </MotionStaggerChild>

            {/* Pro Plan */}
            <MotionStaggerChild>
              <div
                className="rounded-xl p-6 relative"
                style={{
                  background: "rgba(18,18,26,0.8)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.08)",
                }}
              >
                <span
                  className="absolute -top-3 left-6 text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "#00d4ff", color: "#0a0a0f" }}
                >
                  Most Popular
                </span>
                <h3 className="text-xl font-bold text-[#f1f5f9] mb-1">Pro Plan</h3>
                <p className="text-sm text-[#94a3b8] mb-5">Up to 4 connections + Multiview</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[#94a3b8] text-sm">1 Month</span>
                    <span className="text-[#f1f5f9] font-semibold">$35/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                    <span className="text-[#94a3b8] text-sm">6 Months</span>
                    <div className="text-right">
                      <span className="text-[#f1f5f9] font-semibold">$175</span>
                      <span className="text-xs text-[#00d4ff] ml-2">$29.17/mo</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[#94a3b8] text-sm">1 Year</span>
                    <div className="text-right">
                      <span className="text-[#f1f5f9] font-semibold">$335</span>
                      <span className="text-xs text-[#22c55e] ml-2">$27.92/mo</span>
                    </div>
                  </div>
                </div>
                <Link href="/#pricing" className="btn btn-primary w-full justify-center text-sm">
                  Get Started
                </Link>
              </div>
            </MotionStaggerChild>
          </MotionStagger>

          <MotionReveal>
            <p className="text-center text-sm text-[#64748b] mt-6">
              All plans include: 10,000+ channels, full VOD library, HD &amp; 4K streaming, EPG, live sports &amp; PPV, and 24/7 support. No contracts.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ── Setup ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              Set Up Your IPTV Service in Under 5 Minutes
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-10">
              Getting started with OOUStream is straightforward. No technician visits, no complicated equipment, no waiting. If you can download an app and enter a password, you can set up IPTV.
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Choose Your Plan",
                desc: "Pick the Standard (2 connections) or Pro (4 connections) plan and select your billing period. Request a free trial if you want to test first.",
              },
              {
                step: "2",
                title: "Download the App",
                desc: "Install the OOUStream app on your device. On Fire Stick or Android TV, install the Downloader app and enter the code below. On mobile, download from your app store.",
              },
              {
                step: "3",
                title: "Log In and Stream",
                desc: "Enter your credentials, and you're live. Browse 10,000+ channels, explore the VOD library, and start watching immediately in HD or 4K.",
              },
            ].map((item, i) => (
              <MotionStaggerChild key={i}>
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                    style={{
                      background: "rgba(0,212,255,0.1)",
                      border: "2px solid rgba(0,212,255,0.3)",
                      color: "#00d4ff",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>

          {/* Download Code Card */}
          <MotionReveal>
            <div
              className="mt-12 rounded-xl p-6 md:p-8 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))",
                border: "1px solid rgba(0,212,255,0.2)",
              }}
            >
              <h3 className="text-xl font-semibold text-[#f1f5f9] mb-2">
                Fire Stick &amp; Android TV Download Code
              </h3>
              <p className="text-sm text-[#94a3b8] mb-5">
                Install the <strong className="text-[#f1f5f9]">Downloader</strong> app from the Amazon Appstore, then enter this code in the URL bar:
              </p>
              <div
                className="inline-block px-8 py-4 rounded-xl mb-5"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "2px solid rgba(0,212,255,0.4)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.15)",
                }}
              >
                <span
                  className="text-4xl md:text-5xl font-bold tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    color: "#00d4ff",
                    textShadow: "0 0 20px rgba(0,212,255,0.5)",
                  }}
                >
                  9303694
                </span>
              </div>
              <div className="space-y-2 text-sm text-[#94a3b8] max-w-md mx-auto">
                <p className="flex items-center justify-center gap-2">
                  <span className="text-[#22c55e]">&#x2713;</span>
                  Works on all Fire Stick and Android TV devices
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-[#22c55e]">&#x2713;</span>
                  App installs in under 2 minutes
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-[#22c55e]">&#x2713;</span>
                  Then just log in with your credentials and start streaming
                </p>
              </div>
              <p className="text-sm text-[#94a3b8] mt-5">
                <strong className="text-[#f1f5f9]">On Android phone?</strong>{" "}
                Open your browser and go to{" "}
                <a
                  href="http://aftv.news/9303694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00d4ff] hover:underline font-mono"
                >
                  aftv.news/9303694
                </a>{" "}
                to download the app directly.
              </p>
              <p className="text-xs text-[#64748b] mt-5">
                Don&apos;t have credentials yet?{" "}
                <Link href="/#contact" className="text-[#00d4ff] hover:underline">
                  Request a free trial
                </Link>{" "}
                to get your login details and start watching.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* ── Is IPTV Legal ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-6">
              Is IPTV Legal? What You Need to Know
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-5">
              This is one of the most common questions people ask before subscribing to an IPTV service, and the answer is straightforward: <strong className="text-[#f1f5f9]">IPTV technology is 100% legal</strong>. It is simply a method of delivering television content over the internet rather than through cable lines or satellite signals. Major companies like YouTube TV, Hulu + Live TV, Sling TV, and FuboTV all use IPTV technology to deliver their services.
            </p>
            <p className="text-[#94a3b8] leading-relaxed mb-5">
              The legality of any specific IPTV service depends on how the provider sources and licenses their content. Legal IPTV providers operate with proper content agreements and maintain transparent business practices. When choosing an IPTV provider, look for services that have a professional website, responsive customer support, standard payment options, and a clear terms of service.
            </p>
            <p className="text-[#94a3b8] leading-relaxed">
              If an IPTV service is available through major app stores like Amazon Appstore, Apple App Store, or Google Play, it generally indicates that the provider meets platform compliance requirements. Always do your research and choose a provider with a solid reputation and transparent operations.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ── Common Problems ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-4xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              Common IPTV Problems and How to Fix Them
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Even the best IPTV streaming service can run into occasional issues. Here are the most common problems viewers experience and how to solve them quickly.
            </p>
          </MotionReveal>

          <MotionStagger className="space-y-4">
            {[
              {
                title: "Buffering and Freezing",
                problem: "The stream pauses frequently or loads slowly.",
                solutions: [
                  "Use a wired ethernet connection instead of Wi-Fi for the most stable connection",
                  "Restart your router and streaming device",
                  "Close other apps that may be using bandwidth in the background",
                  "Check your internet speed — you need at least 15 Mbps for HD, 50 Mbps for 4K",
                  "Choose a provider like OOUStream that uses anti-buffering server technology",
                ],
              },
              {
                title: "Channel Not Loading",
                problem: "A specific channel shows a black screen or error message.",
                solutions: [
                  "Try switching to a different channel and then back — this often forces a reconnection",
                  "Clear the app cache on your device and restart the app",
                  "Check if the channel is experiencing a temporary outage (contact support)",
                  "Make sure your subscription is active and not expired",
                ],
              },
              {
                title: "App Crashing or Not Opening",
                problem: "The IPTV app freezes or won't launch.",
                solutions: [
                  "Force close the app and reopen it",
                  "Clear the app cache and data in your device settings",
                  "Uninstall and reinstall the app to get the latest version",
                  "Make sure your device has enough storage space available",
                  "Restart your device completely",
                ],
              },
              {
                title: "Poor Customer Support from Provider",
                problem: "You can't get help when something goes wrong.",
                solutions: [
                  "This is a sign of an unreliable provider — consider switching",
                  "Look for providers offering 24/7 support with multiple contact methods",
                  "OOUStream offers AI-powered instant support plus human agents for complex issues",
                  "Check response time before committing — a good provider responds within minutes, not days",
                ],
              },
            ].map((item, i) => (
              <MotionStaggerChild key={i}>
                <div className="rounded-xl p-6" style={{ background: "rgba(18,18,26,0.8)", border: "1px solid #2a2a3a" }}>
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    <em>{item.problem}</em>
                  </p>
                  <ul className="space-y-1.5">
                    {item.solutions.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <span className="text-[#22c55e] mt-0.5 flex-shrink-0">&#x2713;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-3xl mx-auto text-center">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              Ready to Try the Best IPTV Service in 2026?
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Join thousands of viewers who have already cut the cord and switched to OOUStream. With 10,000+ live channels, HD and 4K streaming, a full VOD library, and 24/7 AI-powered support — all starting at just $15 per month — there&apos;s never been a better time to make the switch from cable TV to IPTV.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="btn btn-primary text-base px-8 py-3">
                Get Started Free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/#pricing" className="btn btn-secondary text-base px-8 py-3">
                View Pricing
              </Link>
            </div>
            <p className="text-xs text-[#64748b] mt-4">
              Free trial available. No credit card required. No contracts.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-3xl mx-auto">
          <MotionReveal>
            <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
              Frequently Asked Questions About IPTV
            </h2>
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Got questions about IPTV services? Here are answers to the most common questions from people looking for the best IPTV provider in 2026.
            </p>
          </MotionReveal>

          <MotionReveal>
            <FAQAccordion />
          </MotionReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-14 px-4"
        style={{ borderTop: "1px solid #1a1a24", background: "rgba(18,18,26,0.6)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Image src="/logo-iptv.png" alt="OOUStream" width={200} height={65} className="h-[65px] w-auto mb-4" />
              <p className="text-[#64748b] text-sm leading-relaxed">
                Premium IPTV streaming with thousands of channels, on-demand content, and live sports.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/#features" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Pricing</Link></li>
                <li><Link href="/#contact" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Contact</Link></li>
                <li><Link href="/login" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Customer Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:oouchie@ooustream.com" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    oouchie@ooustream.com
                  </a>
                </li>
                <li>
                  <a href="tel:+13235397508" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    (323) 539-7508
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid #1a1a24" }}>
            <p className="text-xs text-[#64748b]">&copy; {new Date().getFullYear()} OOUStream. All rights reserved.</p>
            <div className="text-xs text-[#64748b]">
              <a href="https://1865freemoney.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d4ff] transition-colors">
                Powered by 1865 Free Money
              </a>
              <span className="block mt-0.5">Digital Excellence &middot; Atlanta, GA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
