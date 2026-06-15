"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface TrialRow {
  id: string;
  customer_id: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  device: string | null;
  card_fingerprint: string | null;
  browser_visitor_id: string | null;
  ip_address: string | null;
  is_vpn: boolean | null;
  risk_score: number;
  status: "active" | "review" | "denied" | "converted" | "expired";
  denial_reason: string | null;
  match_reasons: string[] | null;
  expires_at: string;
  created_at: string;
  customer: { id: string; name: string; email: string; status: string } | null;
}

type Filter = "review" | "denied" | "active" | "all";

const STATUS_STYLES: Record<string, string> = {
  review: "bg-[#f59e0b]/15 text-[#f59e0b]",
  denied: "bg-[#ef4444]/15 text-[#ef4444]",
  active: "bg-[#22c55e]/15 text-[#22c55e]",
  converted: "bg-[#22c55e]/15 text-[#22c55e]",
  expired: "bg-[#64748b]/15 text-[#94a3b8]",
};

export default function AdminTrialsPage() {
  const [trials, setTrials] = useState<TrialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("review");

  useEffect(() => {
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    try {
      const res = await fetch("/api/admin/trials");
      const data = await res.json();
      if (data.trials) setTrials(data.trials);
    } catch {
      toast.error("Failed to fetch trials");
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id: string, status: "active" | "denied") => {
    try {
      const res = await fetch(`/api/admin/trials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === "active" ? "Trial approved" : "Trial denied");
        fetchTrials();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to update trial");
      }
    } catch {
      toast.error("Failed to update trial");
    }
  };

  const filtered = trials.filter((t) =>
    filter === "all" ? true : t.status === filter,
  );

  const count = (s: Filter) =>
    s === "all" ? trials.length : trials.filter((t) => t.status === s).length;

  const riskColor = (score: number) =>
    score >= 70
      ? "text-[#ef4444]"
      : score >= 45
        ? "text-[#f59e0b]"
        : "text-[#22c55e]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Trial Review Queue</h1>
        <p className="text-[#94a3b8] mt-1">
          Flagged free-trial signups and denied abuse attempts. Approve to
          provision a 24h trial; deny to block.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "review", label: `Needs Review (${count("review")})` },
            { key: "denied", label: `Denied (${count("denied")})` },
            { key: "active", label: `Active (${count("active")})` },
            { key: "all", label: `All (${count("all")})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#6366f1] text-white"
                : "bg-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#64748b]">No {filter === "all" ? "" : filter} trials</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status + risk */}
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        STATUS_STYLES[t.status] || "bg-[#64748b]/15 text-[#94a3b8]"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-[#64748b]">
                      Risk:{" "}
                      <span className={`font-bold ${riskColor(t.risk_score)}`}>
                        {t.risk_score}
                      </span>
                    </span>
                    {t.is_vpn && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444]">
                        VOIP/VPN
                      </span>
                    )}
                  </div>

                  {/* Identity */}
                  <p className="text-[#f1f5f9] text-sm font-medium">
                    {t.name || "—"}{" "}
                    <span className="text-[#94a3b8] font-normal">
                      &lt;{t.email}&gt;
                    </span>
                  </p>
                  <div className="text-xs text-[#64748b] mt-1 space-y-0.5">
                    {t.phone && <div>Phone: {t.phone}</div>}
                    {t.device && <div>Device: {t.device}</div>}
                    {t.ip_address && <div>IP: {t.ip_address}</div>}
                    <div>
                      Card fp:{" "}
                      {t.card_fingerprint
                        ? `…${t.card_fingerprint.slice(-6)}`
                        : "none"}{" "}
                      · Browser:{" "}
                      {t.browser_visitor_id
                        ? `…${t.browser_visitor_id.slice(-6)}`
                        : "none"}
                    </div>
                  </div>

                  {/* Reasons */}
                  {(t.match_reasons?.length || t.denial_reason) && (
                    <div className="mt-2 text-xs text-[#fbbf24]">
                      {t.denial_reason || t.match_reasons?.join(" · ")}
                    </div>
                  )}

                  <div className="text-xs text-[#64748b] mt-2">
                    {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-stretch gap-2 flex-shrink-0">
                  {t.status !== "active" && t.status !== "converted" && (
                    <button
                      onClick={() => setStatus(t.id, "active")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/25 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {t.status !== "denied" && (
                    <button
                      onClick={() => setStatus(t.id, "denied")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25 transition-colors"
                    >
                      Deny
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
