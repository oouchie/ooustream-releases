"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RESELLERS = ["Shun", "Prime"];

export default function ResellerLoginPage() {
  const router = useRouter();
  const [reseller, setReseller] = useState(RESELLERS[0]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reseller-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reseller, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/reseller");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Ooustream
          </h1>
          <p className="text-[#94a3b8] mt-2">Reseller Portal</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-[#f1f5f9] mb-6 text-center">
            Reseller Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Reseller</label>
              <select
                value={reseller}
                onChange={(e) => setReseller(e.target.value)}
                className="input"
                required
              >
                {RESELLERS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? <span className="spinner" /> : "Login"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#334155] text-center space-y-2">
            <Link
              href="/login"
              className="block text-sm text-[#94a3b8] hover:text-[#6366f1] transition-colors"
            >
              Customer Login
            </Link>
            <Link
              href="/admin-login"
              className="block text-sm text-[#94a3b8] hover:text-[#6366f1] transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
