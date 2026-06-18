"use client";

import { useState } from "react";
import Link from "next/link";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return last4 ? `(•••) •••-${last4}` : phone;
}

export default function SmsConsentToggle({
  initialConsent,
  phone,
}: {
  initialConsent: boolean;
  phone: string | null;
}) {
  const [consent, setConsent] = useState(initialConsent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPhone = Boolean(phone && phone.replace(/\D/g, "").length >= 10);

  async function toggle() {
    if (saving) return;
    const next = !consent;
    setSaving(true);
    setError(null);
    // optimistic
    setConsent(next);
    try {
      const res = await fetch("/api/customer/sms-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConsent(!next); // revert
        setError(data?.error || "Could not save. Try again.");
      }
    } catch {
      setConsent(!next);
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-[#f1f5f9]">Text me account updates</h3>
          <p className="text-sm text-[#94a3b8] mt-1 leading-snug">
            Get account texts from OOUStream — renewal &amp; payment reminders,
            service notifications (outages, maintenance), and account updates.
            {hasPhone && (
              <>
                {" "}
                Sent to <span className="text-[#cbd5e1]">{maskPhone(phone!)}</span>.
              </>
            )}
          </p>
          <p className="text-xs text-[#64748b] mt-2 leading-snug">
            Optional — leaving this off does not affect your service. Up to a few
            messages per billing cycle. Msg &amp; data rates may apply. Reply STOP to opt
            out, HELP for help. See{" "}
            <Link href="/sms-alerts" className="text-[#00d4ff] hover:underline">
              SMS terms
            </Link>
            . Consent is not a condition of purchase.
          </p>
          {!hasPhone && (
            <p className="text-xs text-[#f59e0b] mt-2">
              No phone number on file —{" "}
              <Link href="/support/new" className="underline hover:text-[#fbbf24]">
                contact support
              </Link>{" "}
              to add one.
            </p>
          )}
          {error && <p className="text-xs text-[#ef4444] mt-2">{error}</p>}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={consent}
          aria-label="Text me account updates"
          disabled={saving || !hasPhone}
          onClick={toggle}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            consent ? "bg-[#00d4ff]" : "bg-[#334155]"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              consent ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
