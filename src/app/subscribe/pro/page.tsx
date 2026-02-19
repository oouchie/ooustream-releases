"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type BillingPeriod = "monthly" | "6month" | "yearly";

interface BillingOption {
  period: BillingPeriod;
  label: string;
  price: number;
  perMonth: string;
  badge?: string;
}

const PRO_OPTIONS: BillingOption[] = [
  { period: "monthly", label: "1 Month", price: 35, perMonth: "$35.00/mo" },
  { period: "6month", label: "6 Months", price: 175, perMonth: "$29.17/mo", badge: "MOST POPULAR" },
  { period: "yearly", label: "1 Year", price: 335, perMonth: "$27.92/mo", badge: "BEST VALUE" },
];

const PRO_FEATURES = [
  "4 Connections (Multiview)",
  "10,000+ Live Channels",
  "Full VOD Library",
  "HD & 4K Streaming",
  "Electronic TV Guide",
  "All Devices Supported",
  "24/7 AI Support",
];

export default function ProCheckoutPage() {
  const [selectedIdx, setSelectedIdx] = useState(1); // Default to 6-month
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = PRO_OPTIONS[selectedIdx];

  const handleCheckout = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/payments/public-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            billingPeriod: selected.period,
            planType: "pro",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong. Please try again.");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, selected.period]
  );

  // Pre-select period from URL hash (e.g. /subscribe/pro#yearly)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const idx = PRO_OPTIONS.findIndex((o) => o.period === hash);
    if (idx !== -1) setSelectedIdx(idx);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-mark-transparent.png"
              alt="OOUStream"
              width={36}
              height={36}
              className="transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold text-[#f1f5f9] hidden sm:inline">OOUStream</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#94a3b8] hover:text-[#00d4ff] transition-colors"
          >
            View all plans
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-mono font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                border: "1px solid rgba(0,212,255,0.3)",
                color: "#00d4ff",
              }}
            >
              PRO PLAN
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-3">
              Stream on{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                4 Screens
              </span>
            </h1>
            <p className="text-[#94a3b8] text-lg">
              Multiview panel support for the whole household.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-px"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              boxShadow: "0 0 60px rgba(0,212,255,0.2), 0 0 100px rgba(124,58,237,0.1)",
            }}
          >
            <div className="rounded-[calc(1rem-1px)] p-8" style={{ background: "#12121a" }}>
              {/* Features */}
              <ul className="space-y-2.5 mb-8" role="list">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#94a3b8]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00d4ff"
                      strokeWidth={2.5}
                      className="w-4 h-4 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Period selector */}
              <div
                className="flex rounded-xl p-1 mb-6 gap-1"
                style={{ background: "#0a0a0f", border: "1px solid #1a1a24" }}
              >
                {PRO_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.period}
                    onClick={() => setSelectedIdx(idx)}
                    className="flex-1 text-xs font-medium py-3 px-2 rounded-lg transition-all duration-200 relative"
                    style={
                      selectedIdx === idx
                        ? {
                            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                            color: "#f1f5f9",
                            boxShadow: "0 0 12px rgba(0,212,255,0.15)",
                          }
                        : { color: "#64748b" }
                    }
                  >
                    {opt.label}
                    {opt.badge && selectedIdx === idx && (
                      <span
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          background: "rgba(251,191,36,0.15)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251,191,36,0.3)",
                        }}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-[#00d4ff]" style={{ letterSpacing: "-0.03em" }}>
                  ${selected.price}
                </span>
                <p className="text-sm text-[#64748b] mt-1">
                  {selected.perMonth} billed{" "}
                  {selected.period === "monthly" ? "monthly" : selected.period === "6month" ? "every 6 months" : "annually"}
                </p>
              </div>

              {/* Email + checkout form */}
              <form onSubmit={handleCheckout} noValidate>
                <div className="mb-4">
                  <label htmlFor="pro-email" className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Email Address
                  </label>
                  <input
                    id="pro-email"
                    type="email"
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] outline-none transition-all duration-200"
                    style={{
                      background: "#0a0a0f",
                      border: "1px solid #2a2a3a",
                    }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                  <p className="text-[#64748b] text-xs mt-2">
                    Your credentials will be sent to this address after payment.
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-[#ef4444] text-sm mb-4 p-3 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "#00d4ff",
                    color: "#0a0a0f",
                    boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="inline-block rounded-full border-2 border-[#0a0a0f] border-t-transparent animate-spin"
                        style={{ width: 18, height: 18 }}
                      />
                      Redirecting to Checkout...
                    </>
                  ) : (
                    <>
                      Continue to Checkout
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[#64748b] text-xs mt-4">
                Secured by <span className="text-[#94a3b8]">Stripe</span>. We never store your card details.
              </p>
            </div>
          </div>

          {/* Already a customer */}
          <p className="text-center text-[#64748b] text-sm mt-8">
            Already a customer?{" "}
            <Link href="/login" className="text-[#00d4ff] hover:underline font-medium">
              Log in to your portal
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
