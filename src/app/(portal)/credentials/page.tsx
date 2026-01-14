"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Credential {
  username: string;
  password: string;
  label: string;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/customer/credentials");
      const data = await response.json();

      if (data.credentials) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const togglePassword = (index: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const sendCredentialsToEmail = async () => {
    try {
      const response = await fetch("/api/customer/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "email" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Credentials sent to your email!");
      } else {
        toast.error(data.error || "Failed to send credentials");
      }
    } catch {
      toast.error("Failed to send credentials");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Your Credentials</h1>
          <p className="text-[#94a3b8] mt-1">
            Use these credentials to log in to your IPTV apps
          </p>
        </div>
        <button
          onClick={sendCredentialsToEmail}
          className="btn btn-secondary hidden sm:flex"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Send to Email
        </button>
      </div>

      {/* Credentials List */}
      {credentials.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[#94a3b8]">No credentials found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#f1f5f9]">{cred.label}</h3>
                <span className="text-xs text-[#94a3b8] bg-[#334155] px-2 py-1 rounded">
                  Credential {index + 1}
                </span>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="label">Username</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 font-mono text-[#f1f5f9]">
                      {cred.username}
                    </div>
                    <button
                      onClick={() => copyToClipboard(cred.username, "Username")}
                      className="p-3 bg-[#334155] hover:bg-[#475569] rounded-lg transition-colors"
                      title="Copy username"
                    >
                      <svg
                        className="w-5 h-5 text-[#94a3b8]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 font-mono text-[#f1f5f9]">
                      {showPasswords[index] ? cred.password : "••••••••"}
                    </div>
                    <button
                      onClick={() => togglePassword(index)}
                      className="p-3 bg-[#334155] hover:bg-[#475569] rounded-lg transition-colors"
                      title={showPasswords[index] ? "Hide password" : "Show password"}
                    >
                      {showPasswords[index] ? (
                        <svg
                          className="w-5 h-5 text-[#94a3b8]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-[#94a3b8]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(cred.password, "Password")}
                      className="p-3 bg-[#334155] hover:bg-[#475569] rounded-lg transition-colors"
                      title="Copy password"
                    >
                      <svg
                        className="w-5 h-5 text-[#94a3b8]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-[#6366f1]/10 border-[#6366f1]/30">
        <h3 className="font-medium text-[#f1f5f9] mb-2">Need Help?</h3>
        <p className="text-sm text-[#94a3b8]">
          Check out our{" "}
          <a href="/help" className="text-[#6366f1] hover:underline">
            setup guides
          </a>{" "}
          for step-by-step instructions on how to use your credentials with
          different apps and devices.
        </p>
      </div>

      {/* Mobile Send Button */}
      <button
        onClick={sendCredentialsToEmail}
        className="btn btn-primary w-full sm:hidden"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Send Credentials to Email
      </button>
    </div>
  );
}
