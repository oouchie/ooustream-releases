"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LoginMethod = "magic" | "username";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("magic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Magic link form
  const [identifier, setIdentifier] = useState("");

  // Username lookup form
  const [username, setUsername] = useState("");
  const [verification, setVerification] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send login link");
        return;
      }

      setSuccess(data.message);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, verification }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
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
          <p className="text-[#94a3b8] mt-2">Customer Portal</p>
        </div>

        {/* Login Card */}
        <div className="card">
          {/* Method Tabs */}
          <div className="flex mb-6 border-b border-[#334155]">
            <button
              onClick={() => setMethod("magic")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                method === "magic"
                  ? "text-[#6366f1] border-b-2 border-[#6366f1]"
                  : "text-[#94a3b8] hover:text-[#f1f5f9]"
              }`}
            >
              Email / Phone
            </button>
            <button
              onClick={() => setMethod("username")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                method === "username"
                  ? "text-[#6366f1] border-b-2 border-[#6366f1]"
                  : "text-[#94a3b8] hover:text-[#f1f5f9]"
              }`}
            >
              Username
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg text-[#22c55e] text-sm">
              {success}
            </div>
          )}

          {/* Magic Link Form */}
          {method === "magic" && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="label">Email or Phone Number</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or phone"
                  className="input"
                  required
                />
              </div>
              <p className="text-xs text-[#94a3b8]">
                We&apos;ll send you a secure login link
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  "Send Login Link"
                )}
              </button>
            </form>
          )}

          {/* Username Lookup Form */}
          {method === "username" && (
            <form onSubmit={handleUsernameLookup} className="space-y-4">
              <div>
                <label className="label">IPTV Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your IPTV username"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Verify Identity</label>
                <input
                  type="text"
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  placeholder="Last 4 digits of phone OR email domain"
                  className="input"
                  required
                />
                <p className="text-xs text-[#94a3b8] mt-1">
                  Example: 1234 or gmail.com
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* Admin & Reseller Links */}
          <div className="mt-6 pt-6 border-t border-[#334155] text-center space-y-2">
            <Link
              href="/reseller-login"
              className="block text-sm text-[#94a3b8] hover:text-[#6366f1] transition-colors"
            >
              Reseller Login
            </Link>
            <Link
              href="/admin-login"
              className="block text-sm text-[#94a3b8] hover:text-[#6366f1] transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#94a3b8] text-xs mt-6">
          Need help? Contact support at info@ooustick.com
        </p>
      </div>
    </div>
  );
}
