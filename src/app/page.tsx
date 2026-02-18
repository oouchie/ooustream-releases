"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingPeriod = "monthly" | "6month" | "yearly";

interface PricingTier {
  period: BillingPeriod;
  label: string;
  price: number;
  perMonth: string;
  badge?: string;
  featured?: boolean;
  features: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PRICING_TIERS: PricingTier[] = [
  {
    period: "monthly",
    label: "1 Month",
    price: 20,
    perMonth: "$20.00/mo",
    features: [
      "10,000+ Live Channels",
      "Full VOD Library",
      "HD & 4K Streaming",
      "Electronic TV Guide",
      "All Devices Supported",
      "24/7 AI Support",
    ],
  },
  {
    period: "6month",
    label: "6 Months",
    price: 90,
    perMonth: "$15.00/mo",
    badge: "MOST POPULAR",
    featured: true,
    features: [
      "10,000+ Live Channels",
      "Full VOD Library",
      "HD & 4K Streaming",
      "Electronic TV Guide",
      "All Devices Supported",
      "24/7 AI Support",
    ],
  },
  {
    period: "yearly",
    label: "1 Year",
    price: 170,
    perMonth: "$14.17/mo",
    badge: "BEST VALUE",
    features: [
      "10,000+ Live Channels",
      "Full VOD Library",
      "HD & 4K Streaming",
      "Electronic TV Guide",
      "All Devices Supported",
      "24/7 AI Support",
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
    name: "Smart TV",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
      </svg>
    ),
  },
  {
    name: "Computer",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
      </svg>
    ),
  },
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

// ─── Hook: Intersection Observer for scroll animations ───────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

interface EmailModalProps {
  tier: PricingTier;
  onClose: () => void;
}

function EmailModal({ tier, onClose }: EmailModalProps) {
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
          body: JSON.stringify({ email: email.trim(), billingPeriod: tier.period }),
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
    [email, tier.period]
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 relative animate-fadeIn"
        style={{
          background: "#12121a",
          border: "1px solid #2a2a3a",
          boxShadow: "0 0 60px rgba(0,212,255,0.15), 0 40px 80px rgba(0,0,0,0.6)",
        }}
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
            Subscribe - {tier.label}
          </h2>
          <p className="text-[#94a3b8] text-sm">
            <span className="text-[#00d4ff] font-bold text-lg">${tier.price}</span>
            {" "}
            &bull; {tier.perMonth}
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
      </div>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const { ref, visible } = useScrollReveal();
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
        <div
          ref={ref}
          className="transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)" }}
        >
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

          {submitted ? (
            <div
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
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card"
              style={{ borderColor: "#2a2a3a" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
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
                </div>
                <div>
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
                </div>
                <div>
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
                </div>
                <div>
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
                    <option value="Smart TV">Smart TV</option>
                    <option value="Computer">Computer (Windows/Mac)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
                style={{ fontSize: "1rem" }}
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
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Section Reveal Wrapper ───────────────────────────────────────────────────

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

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
    document.body.style.overflow = menuOpen || selectedTier ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, selectedTier]);

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
      {selectedTier && (
        <EmailModal
          tier={selectedTier}
          onClose={() => setSelectedTier(null)}
        />
      )}

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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
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
        <div
          id="mobile-menu"
          role="region"
          aria-label="Mobile navigation"
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: menuOpen ? "320px" : "0",
            background: "rgba(10,10,15,0.98)",
            borderTop: menuOpen ? "1px solid #2a2a3a" : "none",
          }}
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a24] transition-all text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 pb-1">
              <Link
                href="/login"
                className="btn btn-primary w-full text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Customer Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Ambient glow orbs */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-20 left-10 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Subtle grid overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase mb-8 animate-fadeIn"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00d4ff",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-glow"
              style={{ background: "#00d4ff", flexShrink: 0 }}
            />
            Premium IPTV Service
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-fadeIn stagger-1"
            style={{ letterSpacing: "-0.03em" }}
          >
            Stream{" "}
            <span className="gradient-text">Everything.</span>
            <br />
            <span style={{ color: "#f1f5f9" }}>Anywhere.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeIn stagger-2"
          >
            Premium IPTV with 10,000+ live channels, an on-demand library of movies and shows,
            live sports and PPV events — all in HD and 4K on any device.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn stagger-3">
            <button
              onClick={() => scrollTo("pricing")}
              className="btn btn-primary text-base px-8 py-4"
              style={{ fontSize: "1rem" }}
            >
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <Link
              href="/login"
              className="btn btn-secondary text-base px-8 py-4"
              style={{ fontSize: "1rem" }}
            >
              Customer Login
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 animate-fadeIn stagger-4">
            {[
              { value: "10,000+", label: "Live Channels" },
              { value: "HD & 4K", label: "Quality" },
              { value: "All Devices", label: "Compatible" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: "#00d4ff" }}>{stat.value}</p>
                <p className="text-xs text-[#64748b] font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fadeIn stagger-5">
          <button
            onClick={() => scrollTo("features")}
            aria-label="Scroll to features"
            className="flex flex-col items-center gap-2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
          >
            <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5 animate-bounce"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Reveal className="text-center mb-16">
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
          </Reveal>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80}>
                <div
                  className="card card-hover group h-full"
                  style={{ "--glow-color": feature.glow } as React.CSSProperties}
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${feature.color} transition-transform duration-300 group-hover:scale-110`}
                    style={{ background: feature.glow, border: `1px solid ${feature.glow}` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#f1f5f9] mb-2">{feature.title}</h3>
                  <p className="text-[#94a3b8] text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Devices ──────────────────────────────────────────────────────────── */}
      <section id="devices" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Reveal className="text-center mb-16">
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
              One subscription. Stream on Firestick, Android, iPhone, Smart TV, and more.
            </p>
          </Reveal>

          {/* Devices — horizontal scroll on mobile, grid on desktop */}
          <Reveal>
            <div className="flex md:grid md:grid-cols-6 gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-thin">
              {DEVICES.map((device, i) => (
                <div
                  key={device.name}
                  className="flex-shrink-0 w-36 md:w-auto group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="card card-hover text-center py-8 px-4 h-full cursor-default"
                    aria-label={device.name}
                  >
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-[#00d4ff] mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-[#7c3aed]"
                      style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
                    >
                      {device.icon}
                    </div>
                    <p className="text-sm font-semibold text-[#f1f5f9]">{device.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Reveal className="text-center mb-16">
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
              Simple,{" "}
              <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
              No hidden fees. No contracts. Cancel anytime. All plans include every feature.
            </p>
          </Reveal>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.period} delay={i * 100}>
                <div
                  className={`relative rounded-2xl p-px transition-all duration-300 ${tier.featured ? "scale-105 md:scale-110 z-10" : ""}`}
                  style={
                    tier.featured
                      ? {
                          background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                          boxShadow: "0 0 60px rgba(0,212,255,0.25), 0 0 100px rgba(124,58,237,0.15)",
                        }
                      : {
                          background: "#2a2a3a",
                        }
                  }
                >
                  <div
                    className="rounded-[calc(1rem-1px)] p-8 h-full flex flex-col"
                    style={{ background: tier.featured ? "#12121a" : "#12121a" }}
                  >
                    {/* Badge */}
                    {tier.badge && (
                      <div className="mb-5">
                        <span
                          className="inline-block text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                          style={
                            tier.featured
                              ? {
                                  background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                                  border: "1px solid rgba(0,212,255,0.3)",
                                  color: "#00d4ff",
                                }
                              : {
                                  background: "rgba(251,191,36,0.1)",
                                  border: "1px solid rgba(251,191,36,0.3)",
                                  color: "#fbbf24",
                                }
                          }
                        >
                          {tier.badge}
                        </span>
                      </div>
                    )}

                    {/* Plan name */}
                    <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">{tier.label}</h3>

                    {/* Price */}
                    <div className="mb-2">
                      <span
                        className="text-5xl font-bold"
                        style={{ color: tier.featured ? "#00d4ff" : "#f1f5f9", letterSpacing: "-0.03em" }}
                      >
                        ${tier.price}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748b] mb-8">{tier.perMonth} billed {tier.period === "monthly" ? "monthly" : tier.period === "6month" ? "every 6 months" : "annually"}</p>

                    {/* Feature list */}
                    <ul className="space-y-3 mb-8 flex-1" role="list">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-[#94a3b8]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={tier.featured ? "#00d4ff" : "#22c55e"}
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

                    {/* CTA */}
                    <button
                      onClick={() => setSelectedTier(tier)}
                      className={`btn w-full text-sm ${tier.featured ? "btn-primary" : "btn-secondary"}`}
                      aria-label={`Subscribe to ${tier.label} plan for $${tier.price}`}
                    >
                      Subscribe Now
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Existing customer callout */}
          <Reveal delay={300}>
            <p className="text-center text-[#64748b] text-sm mt-10">
              Already a customer?{" "}
              <Link href="/login" className="text-[#00d4ff] hover:underline font-medium">
                Log in to your portal
              </Link>{" "}
              to manage your subscription.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ borderTop: "1px solid #1a1a24" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Reveal className="text-center mb-16">
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
          </Reveal>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div
              className="hidden md:block absolute top-12 left-0 right-0 h-px"
              aria-hidden="true"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 20%, rgba(124,58,237,0.3) 80%, transparent)",
                margin: "0 16.67%",
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.number} delay={i * 120}>
                  <div className="relative text-center group">
                    {/* Step number bubble */}
                    <div className="relative inline-flex mb-6">
                      <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto relative z-10 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))",
                          border: "1px solid rgba(0,212,255,0.2)",
                          boxShadow: "0 0 30px rgba(0,212,255,0.06)",
                        }}
                      >
                        <span
                          className="absolute top-2 right-2 text-xs font-mono font-bold"
                          style={{ color: "#00d4ff", opacity: 0.6 }}
                        >
                          {step.number}
                        </span>
                        <span className="text-[#00d4ff]">{step.icon}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#f1f5f9] mb-3">{step.title}</h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <Reveal delay={360}>
            <div className="text-center mt-14">
              <button
                onClick={() => scrollTo("pricing")}
                className="btn btn-primary text-base px-8"
              >
                Get Started Today
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact / Trial Form ──────────────────────────────────────────────── */}
      <ContactForm />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-14 px-4"
        style={{ borderTop: "1px solid #1a1a24", background: "rgba(18,18,26,0.6)" }}
      >
        <div className="max-w-7xl mx-auto">
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
                    href="mailto:info@ooustick.com"
                    className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    info@ooustick.com
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
            <p className="text-xs text-[#64748b]">
              Made with care for premium streaming.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
