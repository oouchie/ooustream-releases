"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

const ELEMENTS_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#00d4ff",
    colorBackground: "#12121a",
    colorText: "#f1f5f9",
    colorDanger: "#ef4444",
    borderRadius: "10px",
    fontFamily: "system-ui, sans-serif",
  },
};

export default function TrialPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupIntentId, setSetupIntentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePromise) {
      setInitError(
        "Payments aren't configured yet. Please contact support to start your trial.",
      );
      return;
    }
    let active = true;
    fetch("/api/trial/setup-intent", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.clientSecret) {
          setClientSecret(d.clientSecret);
          setSetupIntentId(d.setupIntentId);
        } else {
          setInitError(d.error || "Could not start your trial. Please try again.");
        }
      })
      .catch(() => active && setInitError("Could not start your trial. Please try again."));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#f1f5f9] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a3a]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo-full-on-dark.png"
              alt="OOUStream"
              width={150}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link href="/login" className="text-sm text-[#94a3b8] hover:text-[#00d4ff]">
            Already a member? Log in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Start your <span className="gradient-text">24-hour free trial</span>
          </h1>
          <p className="text-[#94a3b8] mt-3">
            10,000+ live channels on every device. We only verify a card to keep
            trials fair —{" "}
            <span className="text-[#f1f5f9] font-medium">
              you won&apos;t be charged during your trial.
            </span>
          </p>
        </div>

        {initError ? (
          <div className="card">
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4 text-[#ef4444] text-sm">
              {initError}
            </div>
          </div>
        ) : !clientSecret || !stripePromise ? (
          <div className="flex justify-center py-16">
            <div className="spinner" />
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: ELEMENTS_APPEARANCE }}
          >
            <TrialForm setupIntentId={setupIntentId!} />
          </Elements>
        )}
      </main>

      {/* Footer with 1865 Free Money branding */}
      <footer className="border-t border-[#2a2a3a] py-6">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-[#64748b]">
          <p className="mb-2">
            <Link href="/terms" className="hover:text-[#94a3b8]">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="hover:text-[#94a3b8]">
              Privacy
            </Link>
          </p>
          <a
            href="https://1865freemoney.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00d4ff] transition-colors"
          >
            Powered by 1865 Free Money
            <br />
            Digital Excellence · Atlanta, GA
          </a>
        </div>
      </footer>
    </div>
  );
}

function TrialForm({ setupIntentId }: { setupIntentId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [device, setDevice] = useState("");
  const [visitorId, setVisitorId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; message: string } | null>(
    null,
  );

  // Browser fingerprint (weak signal; proceeds gracefully if it fails).
  useEffect(() => {
    let active = true;
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((r) => {
        if (active) setVisitorId(r.visitorId);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and phone.");
      return;
    }

    setLoading(true);
    setError(null);

    // Verify the card (SetupIntent, no charge).
    const { error: confirmErr } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/trial` },
      redirect: "if_required",
    });
    if (confirmErr) {
      setError(confirmErr.message || "Your card could not be verified.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          device: device.trim() || undefined,
          setupIntentId,
          browserVisitorId: visitorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "We couldn't start your trial. Please try again.");
        setLoading(false);
        return;
      }
      setResult({ status: data.status, message: data.message || "All set!" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const denied = result.status === "denied";
    return (
      <div className="card text-center">
        <div
          className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
            denied ? "bg-[#ef4444]/15" : "bg-[#22c55e]/15"
          }`}
        >
          <svg
            className={`w-7 h-7 ${denied ? "text-[#ef4444]" : "text-[#22c55e]"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {denied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">
          {denied ? "We couldn't start your trial" : "You're all set!"}
        </h2>
        <p className="text-[#94a3b8] text-sm">{result.message}</p>
        {denied && (
          <Link href="/login" className="btn btn-outline mt-5 inline-block">
            Log in instead
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-3 text-[#ef4444] text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="trial-name">
          Full name
        </label>
        <input
          id="trial-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="trial-email">
            Email
          </label>
          <input
            id="trial-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="trial-phone">
            Phone
          </label>
          <input
            id="trial-phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="trial-device">
          Device (optional)
        </label>
        <input
          id="trial-device"
          className="input"
          placeholder="Firestick, Android TV, phone…"
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Card (verification only — no charge)</label>
        <div className="rounded-lg border border-[#2a2a3a] p-3 bg-[#12121a]">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading || !stripe}
      >
        {loading ? <span className="spinner" /> : "Start my free trial"}
      </button>

      <p className="text-xs text-[#64748b] text-center">
        By starting a trial you agree to our{" "}
        <Link href="/terms" className="text-[#00d4ff] hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#00d4ff] hover:underline">
          Privacy Policy
        </Link>
        . We use limited device and payment signals to prevent trial abuse.
      </p>
    </form>
  );
}
