"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, MotionReveal, MotionStagger, MotionStaggerChild, AnimatedCounter, MagneticLink, ScrollProgressBar } from "@/components/motion";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingPeriod = "monthly" | "6month" | "yearly";
type PlanType = "standard" | "pro";

interface BillingOption {
  period: BillingPeriod;
  label: string;
  price: number;
  perMonth: string;
  badge?: string;
}

interface PlanTier {
  planType: PlanType;
  name: string;
  tagline: string;
  connections: number;
  featured?: boolean;
  features: string[];
  billingOptions: BillingOption[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PLAN_TIERS: PlanTier[] = [
  {
    planType: "standard",
    name: "Standard",
    tagline: "Perfect for personal use",
    connections: 2,
    features: [
      "Up to 2 Connections",
      "10,000+ Live Channels",
      "Full VOD Library",
      "HD & 4K Streaming",
      "Electronic TV Guide",
      "All Devices Supported",
      "24/7 AI Support",
    ],
    billingOptions: [
      { period: "monthly", label: "1 Month", price: 20, perMonth: "$20.00/mo" },
      { period: "6month", label: "6 Months", price: 90, perMonth: "$15.00/mo" },
      { period: "yearly", label: "1 Year", price: 170, perMonth: "$14.17/mo", badge: "BEST VALUE" },
    ],
  },
  {
    planType: "pro",
    name: "Pro",
    tagline: "Multiview for the whole house",
    connections: 4,
    featured: true,
    features: [
      "Up to 4 Connections",
      "Multiview Panel Support",
      "10,000+ Live Channels",
      "Full VOD Library",
      "HD & 4K Streaming",
      "Electronic TV Guide",
      "All Devices Supported",
      "24/7 AI Support",
    ],
    billingOptions: [
      { period: "monthly", label: "1 Month", price: 35, perMonth: "$35.00/mo" },
      { period: "6month", label: "6 Months", price: 175, perMonth: "$29.17/mo" },
      { period: "yearly", label: "1 Year", price: 335, perMonth: "$27.92/mo", badge: "BEST VALUE" },
    ],
  },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875C19.5 4.254 18.996 3.75 18.375 3.75H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: "Live TV",
    description: "10,000+ channels from around the world including news, sports, entertainment, and local broadcasts.",
    color: "text-[#00d4ff]",
    glow: "rgba(0,212,255,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-8.625c0-.621.504-1.125 1.125-1.125H20.25c.621 0 1.125.504 1.125 1.125v8.625M3.375 19.5h17.25" />
      </svg>
    ),
    title: "Movies & Shows",
    description: "Massive on-demand library of movies, TV series, and originals. Always fresh, always updated.",
    color: "text-[#7c3aed]",
    glow: "rgba(124,58,237,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: "Sports",
    description: "Never miss a game. Live sports, PPV events, replays, and dedicated sports channels 24/7.",
    color: "text-[#fbbf24]",
    glow: "rgba(251,191,36,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
    title: "HD & 4K Quality",
    description: "Stream in stunning HD and 4K Ultra HD. Adaptive bitrate ensures smooth playback on any connection.",
    color: "text-[#00d4ff]",
    glow: "rgba(0,212,255,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "TV Guide (EPG)",
    description: "Full electronic program guide so you always know what's on now and what's coming up next.",
    color: "text-[#7c3aed]",
    glow: "rgba(124,58,237,0.12)",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "24/7 AI Support",
    description: "Instant AI-powered help available around the clock. Get answers and resolve issues in seconds.",
    color: "text-[#fbbf24]",
    glow: "rgba(251,191,36,0.12)",
  },
];

const DEVICES = [
  {
    name: "Firestick",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
  {
    name: "Android TV",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M17.6 11.48L19.44 8.3a.63.63 0 00-.22-.83.58.58 0 00-.8.22l-1.88 3.26A11.86 11.86 0 0012 10c-1.64 0-3.19.33-4.54.95L5.58 7.69a.58.58 0 00-.8-.22.63.63 0 00-.22.83l1.84 3.18C3.93 12.9 2.5 15.18 2.5 17.75h19c0-2.57-1.43-4.85-3.9-6.27zM9 16a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    ),
  },
  {
    name: "iPhone/iPad",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M17 1H7a2 2 0 00-2 2v18a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-2zm-5 20a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5-4H7V4h10v13z" />
      </svg>
    ),
  },
  {
    name: "Android Phone",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z" />
      </svg>
    ),
  },
];

const SCREENSHOTS = [
  { src: "/screenshots/app-home.jpg", label: "Home", description: "Featured content & quick browse" },
  { src: "/screenshots/app-livetv.jpg", label: "Live TV", description: "10,000+ channels with EPG guide" },
  { src: "/screenshots/app-movies.jpg", label: "Movies", description: "Huge on-demand movie library" },
  { src: "/screenshots/app-series.jpg", label: "Series", description: "Binge-worthy TV shows" },
  { src: "/screenshots/app-trending.jpg", label: "Trending", description: "What's popular right now" },
];

const STEPS = [
  {
    number: "01",
    title: "Choose Your Plan",
    description: "Pick the subscription that fits your budget. Monthly, 6-month, or annual.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get Your Credentials",
    description: "We set up your account and email your login details within minutes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Start Watching",
    description: "Install the app on any device, enter your credentials, and enjoy premium streaming.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
];

// ─── Channel directory (marquee placeholders) ────────────────────────────────

const CHANNEL_ROW_1 = [
  "ESPN", "HBO", "CNN", "Fox Sports", "NBC", "ABC", "CBS", "Discovery",
  "Hallmark", "TNT", "TBS", "Disney", "Bravo", "USA", "Syfy", "FX", "AMC",
];

const CHANNEL_ROW_2 = [
  "MTV", "VH1", "Lifetime", "Comedy Central", "MSNBC", "Food Network",
  "Nat Geo", "Paramount", "Showtime", "Starz", "Cinemax", "BET",
  "History", "TLC", "A&E", "Oxygen", "HGTV",
];

function SpotlightCard({
  children,
  className = "",
  accentColor = "rgba(0,212,255,0.15)",
}: {
  children: ReactNode;
  className?: string;
  accentColor?: string;
}) {
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${x}%`);
    e.currentTarget.style.setProperty("--my", `${y}%`);
  };
  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "50%");
    e.currentTarget.style.setProperty("--my", "50%");
  };
  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`spotlight-card ${className}`}
      style={
        {
          background: "#12121a",
          border: "1px solid #2a2a3a",
          borderRadius: "1rem",
          padding: "1.75rem",
          "--spotlight-color": accentColor,
          transition: "border-color 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function DrawingCheck({ color = "#22c55e", delay = 0 }: { color?: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 flex-shrink-0"
      aria-hidden="true"
    >
      <motion.path
        d="M4.5 12.75l6 6 9-13.5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </motion.svg>
  );
}

function ChannelPill({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap font-mono text-sm tracking-wide"
      style={{
        background: "rgba(18,18,26,0.85)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "#e2e8f0",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }}
      />
      {name}
    </div>
  );
}

// ─── Framer Motion powered (see @/components/motion.tsx) ─────────────────────

// ─── Email Modal ──────────────────────────────────────────────────────────────

interface EmailModalProps {
  planType: PlanType;
  billingOption: BillingOption;
  planName: string;
  onClose: () => void;
}

function EmailModal({ planType, billingOption, planName, onClose }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
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
          body: JSON.stringify({ email: email.trim(), billingPeriod: billingOption.period, planType }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong. Please try again.");
          return;
        }

        if (data.url) {
          window.fbq?.("track", "Lead", {
            content_name: `${planType} - ${billingOption.period}`,
            currency: "USD",
            value: billingOption.price,
          });
          window.location.href = data.url;
        }
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, billingOption.period, planType, billingOption.price]
  );

  // Close on backdrop click
  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl p-8 relative"
        style={{
          background: "#12121a",
          border: "1px solid #2a2a3a",
          boxShadow: "0 0 60px rgba(0,212,255,0.15), 0 40px 80px rgba(0,0,0,0.6)",
        }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
          aria-label="Close dialog"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={1.5} className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-[#f1f5f9] mb-1">
            Subscribe - {planName} {billingOption.label}
          </h2>
          <p className="text-[#94a3b8] text-sm">
            <span className="text-[#00d4ff] font-bold text-lg">${billingOption.price}</span>
            {" "}
            &bull; {billingOption.perMonth}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="checkout-email" className="label">
              Email Address
            </label>
            <input
              id="checkout-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "modal-error" : undefined}
            />
            <p className="text-[#64748b] text-xs mt-2">
              Your credentials will be sent to this address after payment.
            </p>
          </div>

          {error && (
            <p
              id="modal-error"
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
            className="btn btn-primary w-full text-base"
            style={{ fontSize: "1rem" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
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
          Secured by{" "}
          <span className="text-[#94a3b8]">Stripe</span>. We never store your card details.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection() {
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      rating: number;
      review_text: string;
      display_name: string;
      created_at: string;
    }>
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || reviews.length === 0) return null;

  return (
    <section className="py-24 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
      <div className="max-w-5xl mx-auto">
        <MotionReveal className="text-center mb-16">
          <span
            className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "#fbbf24",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
            What Our{" "}
            <span className="gradient-text">Customers Say</span>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
            Real reviews from verified Ooustream subscribers.
          </p>
        </MotionReveal>

        <MotionStagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          staggerDelay={0.1}
        >
          {reviews.slice(0, 6).map((review) => (
            <MotionStaggerChild key={review.id}>
              <motion.div
                className="card card-hover h-full flex flex-col"
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
              >
                {/* Star rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? "text-[#fbbf24]"
                          : "text-[#334155]"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-[#cbd5e1] text-sm leading-relaxed flex-1 mb-4">
                  &ldquo;{review.review_text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#1e293b]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))",
                      border: "1px solid rgba(0,212,255,0.3)",
                      color: "#00d4ff",
                    }}
                  >
                    {review.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f1f5f9]">
                      {review.display_name}
                    </p>
                    <p className="text-xs text-[#64748b]">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            </MotionStaggerChild>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    device: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <MotionReveal>
          {/* Section header */}
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#fbbf24",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              Free Trial
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              Request a{" "}
              <span className="gradient-text">Free Trial</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-lg mx-auto">
              Not ready to commit? Fill out the form below and we will set up a free trial for you.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="card text-center py-12"
                style={{ borderColor: "rgba(34,197,94,0.3)", boxShadow: "0 0 40px rgba(34,197,94,0.08)" }}
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2} className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">Message Sent!</h3>
                <p className="text-[#94a3b8]">Thanks! We will be in touch shortly to set up your free trial.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                noValidate
                className="card"
                style={{ borderColor: "#2a2a3a" }}
              >
                <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5" staggerDelay={0.06}>
                  <MotionStaggerChild>
                    <label htmlFor="contact-name" className="label">
                      Full Name <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="input"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </MotionStaggerChild>
                  <MotionStaggerChild>
                    <label htmlFor="contact-email" className="label">
                      Email Address <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </MotionStaggerChild>
                  <MotionStaggerChild>
                    <label htmlFor="contact-phone" className="label">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className="input"
                      placeholder="(323) 000-0000"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </MotionStaggerChild>
                  <MotionStaggerChild>
                    <label htmlFor="contact-device" className="label">
                      Your Device
                    </label>
                    <select
                      id="contact-device"
                      name="device"
                      className="input"
                      value={form.device}
                      onChange={handleChange}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="">Select a device...</option>
                      <option value="Firestick">Amazon Firestick</option>
                      <option value="Android TV">Android TV / Box</option>
                      <option value="iPhone/iPad">iPhone / iPad</option>
                      <option value="Android Phone">Android Phone/Tablet</option>
                      <option value="Other">Other</option>
                    </select>
                  </MotionStaggerChild>
                </MotionStagger>

                <div className="mb-6">
                  <label htmlFor="contact-message" className="label">
                    Message <span className="text-[#ef4444]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="input resize-none"
                    rows={4}
                    placeholder="Tell us a bit about yourself or ask a question..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-[#ef4444] text-sm mb-5 p-3 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{ fontSize: "1rem" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Request
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </MotionReveal>
      </div>
    </section>
  );
}

// ─── Channel Wall — the signature hero backdrop ──────────────────────────────

const WALL_ROWS = [
  ["ESPN", "HBO", "CNN", "Fox Sports", "NBC", "ABC", "CBS", "Discovery", "Hallmark", "TNT"],
  ["TBS", "Disney", "Bravo", "USA", "Syfy", "FX", "AMC", "BET", "MTV", "VH1"],
  ["Lifetime", "Comedy Central", "MSNBC", "Food Network", "Nat Geo", "Paramount", "Showtime", "Starz", "Cinemax", "History"],
  ["TLC", "A&E", "Oxygen", "HGTV", "Cartoon Network", "Nickelodeon", "BBC", "Sky Sports", "beIN Sports", "ESPN+"],
  ["HBO Max", "Fox News", "CNBC", "PBS", "Animal Planet", "Travel", "Sci-Fi", "truTV", "Freeform", "OWN"],
  ["Telemundo", "Univision", "MLB Network", "NFL Network", "NBA TV", "NHL Network", "Golf", "Tennis Channel", "FS1", "ESPN2"],
  ["VICE", "Reelz", "Pop TV", "BET+", "WE tv", "Court TV", "ION", "Newsmax", "One America", "Revolt"],
];

function ChannelWall() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafId = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        const grid = gridRef.current;
        if (!section || !grid) return;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.max(0, Math.min(1, -rect.top / (vh * 0.6)));

        grid.style.opacity = `${0.1 - p * 0.08}`;
        grid.style.transform = `perspective(1200px) scale(${1 - p * 0.15}) rotateX(${p * 12}deg)`;

        rowRefs.current.forEach((row, i) => {
          if (!row) return;
          const dir = i % 2 === 0 ? 1 : -1;
          const speed = 0.8 + (i % 3) * 0.4;
          row.style.transform = `translate3d(${p * dir * speed * 120}px, 0, 0)`;
        });
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }}
    >
      <div
        ref={gridRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{
          opacity: 0.1,
          transformOrigin: "center top",
          willChange: "transform, opacity",
        }}
      >
        {WALL_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            ref={(el) => { rowRefs.current[rowIdx] = el; }}
            className="flex gap-3 whitespace-nowrap"
          >
            {row.map((name) => (
              <div
                key={name}
                className="px-4 py-2 rounded-lg font-mono text-xs tracking-wide"
                style={{
                  background: "rgba(18,18,26,0.5)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  color: "rgba(225,232,240,0.6)",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scroll-Scrubbed Video — drives <video>.currentTime from scroll position ──

function ScrollScrubbedVideo({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const isTouch = !window.matchMedia("(pointer: fine)").matches;

    if (isTouch) {
      video.loop = true;
      video.play().catch(() => {});
      return;
    }

    const rafId = { current: 0 };
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height) / (vh + rect.height)));
        if (video.duration) {
          video.currentTime = progress * video.duration;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ─── App Showcase ─────────────────────────────────────────────────────────────

// Drop a muted 8-10s H.264 loop at /public/showcase-reel.mp4 and set this true.
// When present, the TV frame renders a video whose currentTime scrubs with scroll.
const SHOWCASE_VIDEO_SRC: string | null = "/showcase-reel.mp4";

function AppShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tvRef = useRef<HTMLDivElement | null>(null);

  // Auto-rotate every 4 seconds, pause on manual interaction for 10s
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SCREENSHOTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  const handleManualSelect = useCallback((i: number) => {
    setActive(i);
    setPaused(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPaused(false), 10000);
  }, []);

  // Pointer-tracked 3D tilt on the TV frame
  const handleFrameMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = tvRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1400px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  };
  const handleFrameLeave = () => {
    if (tvRef.current) {
      tvRef.current.style.transform = "perspective(1400px) rotateY(0) rotateX(0)";
    }
  };

  return (
    <section id="showcase" className="py-24 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
      <div className="max-w-6xl mx-auto">
        <MotionReveal>
          {/* Header */}
          <div className="text-center mb-14">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#7c3aed",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              App Preview
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              See It in{" "}
              <span className="gradient-text">Action</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              A premium streaming experience built for your TV. Browse channels, movies, and series with ease.
            </p>
          </div>

          {/* Tabs with sliding indicator */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SCREENSHOTS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => handleManualSelect(i)}
                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                style={{
                  background: "rgba(30,41,59,0.5)",
                  border: "1px solid #334155",
                  color: active === i ? "#00d4ff" : "#94a3b8",
                }}
              >
                {active === i && (
                  <motion.div
                    layoutId="showcase-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                      border: "1px solid rgba(0,212,255,0.4)",
                      boxShadow: "0 0 20px rgba(0,212,255,0.1)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Screenshot Display — 3D-tilted TV frame with reflection */}
          <div
            className="relative"
            style={{ perspective: "1400px" }}
            onPointerMove={handleFrameMove}
            onPointerLeave={handleFrameLeave}
          >
            <motion.div
              ref={tvRef}
              className="relative mx-auto rounded-2xl overflow-hidden"
              style={{
                maxWidth: 900,
                border: "3px solid #2a2a3a",
                background: "#0a0a0f",
                transformStyle: "preserve-3d",
                transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
              animate={{
                boxShadow: [
                  "0 0 60px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.5)",
                  "0 0 80px rgba(0,212,255,0.14), 0 40px 80px rgba(0,0,0,0.5)",
                  "0 0 60px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.5)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative" style={{ aspectRatio: "16/10" }}>
                {SHOWCASE_VIDEO_SRC ? (
                  <ScrollScrubbedVideo src={SHOWCASE_VIDEO_SRC} />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={SCREENSHOTS[active].src}
                        alt={`Ooustream IPTV - ${SCREENSHOTS[active].label}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 900px"
                        className="object-cover"
                        priority={active === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
                {/* Soft glare sweep across the screen — premium feel */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
                    mixBlendMode: "overlay",
                  }}
                />
              </div>
            </motion.div>

            {/* Floor reflection — fades out, matches the frame */}
            <div
              aria-hidden="true"
              className="relative mx-auto -mt-px overflow-hidden"
              style={{
                maxWidth: 900,
                height: 140,
                transform: "scaleY(-1)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.22), transparent 70%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.22), transparent 70%)",
                opacity: 0.5,
                filter: "blur(0.5px)",
              }}
            >
              <div className="relative" style={{ aspectRatio: "16/10" }}>
                {!SHOWCASE_VIDEO_SRC && (
                  <Image
                    src={SCREENSHOTS[active].src}
                    alt=""
                    fill
                    sizes="900px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Caption with AnimatePresence */}
          <div className="text-center mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[#f1f5f9] font-semibold text-lg">{SCREENSHOTS[active].label}</p>
                <p className="text-[#64748b] text-sm">{SCREENSHOTS[active].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature highlights removed — redundant with Features bento section */}
        </MotionReveal>
      </div>
    </section>
  );
}

// Reveal is now MotionReveal from @/components/motion.tsx

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<{ planType: PlanType; billingOption: BillingOption; planName: string } | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<PlanType, number>>({ standard: 1, pro: 1 });

  // Detect scroll for sticky header
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll when menu or modal is open
  useEffect(() => {
    document.body.style.overflow = menuOpen || selectedCheckout ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, selectedCheckout]);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Devices", id: "devices" },
    { label: "Pricing", id: "pricing" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>

      {/* ── Checkout Email Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCheckout && (
          <EmailModal
            planType={selectedCheckout.planType}
            billingOption={selectedCheckout.billingOption}
            planName={selectedCheckout.planName}
            onClose={() => setSelectedCheckout(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Sticky Header ────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(42,42,58,0.8)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16" role="navigation" aria-label="Main navigation">
            {/* Logo */}
            <a href="#" aria-label="Ooustream - Back to top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <Image
                src="/logo-iptv.png"
                alt="Ooustream"
                width={240}
                height={80}
                className="h-[80px] w-auto"
                priority
              />
            </a>

            {/* Desktop nav — magnetic links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <MagneticLink
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
                >
                  {link.label}
                </MagneticLink>
              ))}
            </div>

            {/* Desktop CTA — ⌘K + login */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollTo("features")}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                style={{
                  background: "rgba(18,18,26,0.6)",
                  border: "1px solid rgba(42,42,58,0.8)",
                }}
                aria-label="Open quick search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
                <span>Quick Search</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(42,42,58,0.9)", color: "#cbd5e1" }}>⌘K</kbd>
              </button>
              <Link
                href="/login"
                className="btn btn-secondary text-sm py-2 px-5"
              >
                Customer Login
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              role="region"
              aria-label="Mobile navigation"
              className="md:hidden overflow-hidden"
              style={{
                background: "rgba(10,10,15,0.98)",
                borderTop: "1px solid #2a2a3a",
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                className="px-4 py-4 flex flex-col gap-1"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {navLinks.map((link) => (
                  <motion.button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="w-full text-left px-4 py-3 rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a24] transition-all text-sm font-medium"
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  >
                    {link.label}
                  </motion.button>
                ))}
                <motion.div
                  className="pt-2 pb-1"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href="/login"
                    className="btn btn-primary w-full text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Customer Login
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll progress bar — pinned to header bottom edge */}
        <ScrollProgressBar className="hidden md:block absolute left-0 right-0 bottom-0 h-[1.5px] origin-left" />
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-dvh flex items-center justify-center overflow-hidden px-4">
        {/* Channel Wall — grid of real channel names behind the hero text */}
        <ChannelWall />

        {/* Grain/noise overlay — premium depth */}
        <div aria-hidden="true" className="noise-overlay" />

        {/* Radial spotlight under headline for depth */}
        <div
          aria-hidden="true"
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-20 max-w-5xl mx-auto text-center pt-24 pb-40 md:pb-44">
          {/* Pill badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase mb-8"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00d4ff",
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span
              className="w-2 h-2 rounded-full animate-glow"
              style={{ background: "#00d4ff", flexShrink: 0 }}
            />
            Premium IPTV Service
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
            style={{ letterSpacing: "-0.035em" }}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
          >
            <motion.span
              className="gradient-text inline-block"
              variants={{ hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } }}
            >
              10,000
            </motion.span>{" "}
            <motion.span
              style={{ color: "#f1f5f9" }}
              className="inline-block"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } }}
            >
              Live Channels.
            </motion.span>
            <br />
            <motion.span
              style={{ color: "#f1f5f9" }}
              className="inline-block"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } }}
            >
              One App.
            </motion.span>{" "}
            <motion.span
              style={{ color: "#f1f5f9" }}
              className="inline-block"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } }}
            >
              Every Device.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Live TV, full VOD library, sports and PPV — in HD and 4K on any device you already own.
            No cable box. No contracts.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.button
              onClick={() => scrollTo("pricing")}
              className="btn btn-primary text-base px-8 py-4"
              style={{ fontSize: "1rem" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(0,212,255,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/login"
                className="btn btn-secondary text-base px-8 py-4"
                style={{ fontSize: "1rem" }}
              >
                Customer Login
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust pills — real claims, not fluff stats */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#94a3b8]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            {[
              "No contracts",
              "Instant activation",
              "Works on everything you own",
            ].map((pill, i) => (
              <div key={pill} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={2.5} className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{pill}</span>
                {i < 2 && <span className="hidden sm:inline text-[#334155] ml-4">·</span>}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Channel logo marquee — the social proof */}
        <motion.div
          className="absolute left-0 right-0 bottom-4 md:bottom-8 z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          aria-label="Channel directory"
        >
          <div className="marquee-group marquee-mask py-2 overflow-hidden">
            <div className="marquee-track">
              {[...CHANNEL_ROW_1, ...CHANNEL_ROW_1].map((name, i) => (
                <ChannelPill key={`r1-${i}`} name={name} />
              ))}
            </div>
          </div>
          <div className="marquee-group marquee-mask py-2 mt-2 overflow-hidden">
            <div className="marquee-track reverse">
              {[...CHANNEL_ROW_2, ...CHANNEL_ROW_2].map((name, i) => (
                <ChannelPill key={`r2-${i}`} name={name} />
              ))}
            </div>
          </div>
        </motion.div>

      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <MotionReveal className="text-center mb-16">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#00d4ff",
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
              }}
            >
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              Why Choose{" "}
              <span className="gradient-text">Ooustream</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              Everything you need for the ultimate streaming experience, all in one service.
            </p>
          </MotionReveal>

          {/* Bento grid — 2 hero cells + 4 standard, each with pointer-tracked spotlight */}
          <MotionStagger className="grid grid-cols-1 md:grid-cols-4 gap-4" staggerDelay={0.08}>
            {FEATURES.map((feature, idx) => {
              const isHero = idx < 2;
              return (
                <MotionStaggerChild key={feature.title} className={isHero ? "md:col-span-2" : "md:col-span-1"}>
                  <SpotlightCard accentColor={feature.glow} className="h-full flex flex-col">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${feature.color}`}
                      style={{ background: feature.glow, border: `1px solid ${feature.glow}` }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className={`font-bold text-[#f1f5f9] mb-2 ${isHero ? "text-2xl" : "text-lg"}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-[#94a3b8] leading-relaxed ${isHero ? "text-base" : "text-sm"}`}>
                      {feature.description}
                    </p>
                    {isHero && (
                      <div className="mt-6 pt-6 flex items-center gap-2 text-xs font-mono tracking-wider uppercase" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: feature.color.replace("text-[", "").replace("]", "") }}>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: feature.color.replace("text-[", "").replace("]", ""), boxShadow: `0 0 6px ${feature.glow}` }}
                        />
                        {idx === 0 ? "Live Right Now" : "Updated Daily"}
                      </div>
                    )}
                  </SpotlightCard>
                </MotionStaggerChild>
              );
            })}
          </MotionStagger>
        </div>
      </section>

      {/* ── App Showcase ──────────────────────────────────────────────────────── */}
      <AppShowcase />

      {/* ── Devices ──────────────────────────────────────────────────────────── */}
      <section id="devices" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <MotionReveal className="text-center mb-16">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#7c3aed",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              Compatibility
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              Works on{" "}
              <span className="gradient-text">All Your Devices</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              One subscription. Stream on Firestick, Android TV, iPhone, and Android devices.
            </p>
          </MotionReveal>

          {/* Devices — horizontal scroll on mobile, grid on desktop */}
          <MotionStagger className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-thin marquee-mask md:[mask-image:none] md:[-webkit-mask-image:none]" staggerDelay={0.1}>
            {DEVICES.map((device) => (
              <MotionStaggerChild
                key={device.name}
                className="flex-shrink-0 w-36 md:w-auto group"
              >
                <motion.div
                  className="card card-hover text-center py-8 px-4 h-full cursor-default"
                  aria-label={device.name}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                >
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-[#00d4ff] mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-[#7c3aed]"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
                  >
                    {device.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#f1f5f9]">{device.name}</p>
                </motion.div>
              </MotionStaggerChild>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <MotionReveal className="text-center mb-16">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#fbbf24",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              Choose Your{" "}
              <span className="gradient-text">Perfect Plan</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              No hidden fees. No contracts. Cancel anytime. Pick the plan that fits your needs.
            </p>
          </MotionReveal>

          {/* Plan cards - side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
            {PLAN_TIERS.map((plan, planIdx) => {
              const periodIdx = selectedPeriods[plan.planType];
              const currentOption = plan.billingOptions[periodIdx];
              return (
                <MotionReveal key={plan.planType} delay={planIdx * 150}>
                  <motion.div
                    className="relative rounded-2xl p-px"
                    style={
                      plan.featured
                        ? {
                            background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                          }
                        : {
                            background: "#2a2a3a",
                          }
                    }
                    whileHover={plan.featured
                      ? { y: -6, boxShadow: "0 0 80px rgba(0,212,255,0.35), 0 0 120px rgba(124,58,237,0.2)" }
                      : { y: -4, boxShadow: "0 0 40px rgba(0,212,255,0.1)" }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    initial={plan.featured ? { boxShadow: "0 0 60px rgba(0,212,255,0.25), 0 0 100px rgba(124,58,237,0.15)" } : {}}
                  >
                    <div
                      className="rounded-[calc(1rem-1px)] p-8 h-full flex flex-col"
                      style={{ background: "#12121a" }}
                    >
                      {/* Plan badge */}
                      {plan.featured && (
                        <div className="mb-4">
                          <span
                            className="inline-block text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                            style={{
                              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                              border: "1px solid rgba(0,212,255,0.3)",
                              color: "#00d4ff",
                            }}
                          >
                            RECOMMENDED
                          </span>
                        </div>
                      )}

                      {/* Plan name & connections */}
                      <h3 className="text-2xl font-bold text-[#f1f5f9] mb-1">{plan.name}</h3>
                      <p className="text-sm text-[#94a3b8] mb-1">{plan.tagline}</p>
                      <p className="text-xs font-mono mb-6" style={{ color: plan.featured ? "#00d4ff" : "#7c3aed" }}>
                        {plan.connections} Connections
                      </p>

                      {/* Billing period selector */}
                      <div
                        className="flex rounded-xl p-1 mb-6 gap-1"
                        style={{ background: "#0a0a0f", border: "1px solid #1a1a24" }}
                      >
                        {plan.billingOptions.map((opt, optIdx) => (
                          <button
                            key={opt.period}
                            onClick={() => setSelectedPeriods(prev => ({ ...prev, [plan.planType]: optIdx }))}
                            className="flex-1 text-xs font-medium py-2.5 px-2 rounded-lg transition-all duration-200 relative"
                            style={
                              periodIdx === optIdx
                                ? {
                                    background: plan.featured
                                      ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))"
                                      : "rgba(124,58,237,0.12)",
                                    color: "#f1f5f9",
                                    boxShadow: plan.featured
                                      ? "0 0 12px rgba(0,212,255,0.15)"
                                      : "0 0 12px rgba(124,58,237,0.1)",
                                  }
                                : {
                                    color: "#64748b",
                                  }
                            }
                          >
                            {opt.label}
                            {opt.badge && periodIdx === optIdx && (
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

                      {/* Price display — morphing animation */}
                      <div className="mb-2 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={currentOption.price}
                            className="text-5xl font-bold inline-block"
                            style={{ color: plan.featured ? "#00d4ff" : "#f1f5f9", letterSpacing: "-0.03em" }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            ${currentOption.price}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentOption.perMonth}
                          className="text-sm text-[#64748b] mb-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {currentOption.perMonth} billed{" "}
                          {currentOption.period === "monthly" ? "monthly" : currentOption.period === "6month" ? "every 6 months" : "annually"}
                        </motion.p>
                      </AnimatePresence>

                      {/* Animated savings pill — slides in when user selects 6mo or yearly */}
                      <div className="mb-8 h-7">
                        <AnimatePresence mode="wait">
                          {currentOption.period !== "monthly" && (() => {
                            const months = currentOption.period === "6month" ? 6 : 12;
                            const monthlyPrice = plan.billingOptions[0].price;
                            const savings = monthlyPrice * months - currentOption.price;
                            return (
                              <motion.div
                                key={currentOption.period}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                                style={{
                                  background: "rgba(34,197,94,0.12)",
                                  border: "1px solid rgba(34,197,94,0.3)",
                                  color: "#4ade80",
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span>Save</span>
                                <AnimatedCounter value={savings} prefix="$" />
                                <span className="text-[#4ade80]/70">vs monthly</span>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      </div>

                      {/* Feature list — checkmarks draw themselves in stagger */}
                      <ul className="space-y-3 mb-8 flex-1" role="list">
                        {plan.features.map((f, fi) => (
                          <li key={f} className="flex items-center gap-3 text-sm text-[#94a3b8]">
                            <DrawingCheck color={plan.featured ? "#00d4ff" : "#22c55e"} delay={fi * 0.04} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <motion.button
                        onClick={() => setSelectedCheckout({ planType: plan.planType, billingOption: currentOption, planName: plan.name })}
                        className={`btn w-full text-sm ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                        aria-label={`Subscribe to ${plan.name} plan for $${currentOption.price}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Subscribe Now
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                </MotionReveal>
              );
            })}
          </div>

          {/* Existing customer callout */}
          <MotionReveal delay={300}>
            <p className="text-center text-[#64748b] text-sm mt-10">
              Already a customer?{" "}
              <Link href="/login" className="text-[#00d4ff] hover:underline font-medium">
                Log in to your portal
              </Link>{" "}
              to manage your subscription.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <MotionReveal className="text-center mb-16">
            <span
              className="inline-block text-xs font-mono font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#00d4ff",
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
              }}
            >
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">
              Up and Running in{" "}
              <span className="gradient-text">Minutes</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              Getting started with Ooustream is simple. Follow these three easy steps.
            </p>
          </MotionReveal>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line — draws itself */}
            <motion.div
              className="hidden md:block absolute top-12 left-0 right-0 h-px"
              aria-hidden="true"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 20%, rgba(124,58,237,0.3) 80%, transparent)",
                margin: "0 16.67%",
                transformOrigin: "left",
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />

            <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
              {STEPS.map((step) => (
                <MotionStaggerChild key={step.number}>
                  <div className="relative text-center group">
                    {/* Step number bubble */}
                    <div className="relative inline-flex mb-6">
                      <motion.div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto relative z-10"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))",
                          border: "1px solid rgba(0,212,255,0.2)",
                          boxShadow: "0 0 30px rgba(0,212,255,0.06)",
                        }}
                        whileHover={{ scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                      >
                        <span
                          className="absolute top-2 right-2 text-xs font-mono font-bold"
                          style={{ color: "#00d4ff", opacity: 0.6 }}
                        >
                          {step.number}
                        </span>
                        <span className="text-[#00d4ff]">{step.icon}</span>
                      </motion.div>
                    </div>

                    <h3 className="text-lg font-bold text-[#f1f5f9] mb-3">{step.title}</h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </MotionStaggerChild>
              ))}
            </MotionStagger>
          </div>

          {/* Bottom CTA */}
          <MotionReveal delay={360}>
            <div className="text-center mt-14">
              <motion.button
                onClick={() => scrollTo("pricing")}
                className="btn btn-primary text-base px-8"
                whileHover={{ scale: 1.03, boxShadow: "0 0 35px rgba(0,212,255,0.5)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Get Started Today
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.button>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Contact / Trial Form ──────────────────────────────────────────────── */}
      <ContactForm />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-14 px-4"
        style={{ borderTop: "1px solid #1a1a24", background: "rgba(18,18,26,0.6)" }}
      >
        <MotionReveal className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Image
                src="/logo-iptv.png"
                alt="Ooustream"
                width={200}
                height={65}
                className="h-[65px] w-auto mb-4"
              />
              <p className="text-[#64748b] text-sm leading-relaxed">
                Premium IPTV streaming with thousands of channels, on-demand content, and live sports.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-3" role="list">
                {[
                  { label: "Features", id: "features" },
                  { label: "Pricing", id: "pricing" },
                  { label: "Contact", id: "contact" },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <Link
                    href="/best-iptv-service"
                    className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    Best IPTV Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subscribe/pro"
                    className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    Subscribe Pro
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    Customer Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3" role="list">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4">Contact Us</h4>
              <ul className="space-y-3" role="list">
                <li>
                  <a
                    href="mailto:oouchie@ooustream.com"
                    className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    oouchie@ooustream.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+13235397508"
                    className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    (323) 539-7508
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid #1a1a24" }}
          >
            <p className="text-xs text-[#64748b]">
              &copy; {new Date().getFullYear()} Ooustream. All rights reserved.
            </p>
            <div className="text-xs text-[#64748b]">
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
          </div>
        </MotionReveal>
      </footer>
    </div>
  );
}
