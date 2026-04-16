"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

interface Credential {
  username: string;
  password: string;
  label: string;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
    setSavedUsername(localStorage.getItem("ooustream_saved_username"));
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/customer/credentials");
      const data = await response.json();
      if (data.credentials) setCredentials(data.credentials);
      if (data.playlistUrl) setPlaylistUrl(data.playlistUrl);
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveUsernameForLogin = (usernameToSave: string) => {
    if (savedUsername === usernameToSave) {
      localStorage.removeItem("ooustream_saved_username");
      setSavedUsername(null);
      toast.success("Username removed from quick login");
    } else {
      localStorage.setItem("ooustream_saved_username", usernameToSave);
      setSavedUsername(usernameToSave);
      toast.success("Username saved for quick login");
    }
  };

  const copyToClipboard = useCallback(async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const togglePassword = (index: number) => {
    setShowPasswords((prev) => ({ ...prev, [index]: !prev[index] }));
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
    <div className="space-y-5 animate-fadeIn">
      {/* Header + Send to Email (visible on all sizes, not buried at bottom) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Your Credentials</h1>
          <p className="text-[#94a3b8] text-sm mt-1">
            Tap any field to copy it — then paste into your TV app
          </p>
        </div>
        <button
          onClick={sendCredentialsToEmail}
          className="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email My Credentials
        </button>
      </div>

      {/* Playlist URL */}
      {playlistUrl && (
        <button
          type="button"
          onClick={() => copyToClipboard(playlistUrl, "playlist")}
          className="card border-[#00d4ff]/30 bg-[#00d4ff]/5 w-full text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#f1f5f9]">Playlist URL</h3>
            <span className="text-xs font-mono px-2 py-1 rounded transition-all duration-200"
              style={{
                background: copiedField === "playlist" ? "rgba(34,197,94,0.15)" : "rgba(0,212,255,0.1)",
                color: copiedField === "playlist" ? "#4ade80" : "#00d4ff",
              }}
            >
              {copiedField === "playlist" ? "Copied!" : "Tap to copy"}
            </span>
          </div>
          <div className="bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 font-mono text-[#00d4ff] text-base tracking-wide break-all">
            {playlistUrl}
          </div>
          <p className="text-xs text-[#94a3b8] mt-2">
            Enter this URL as the server/playlist URL in your IPTV app
          </p>
        </button>
      )}

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
                {/* Username — tap entire field to copy */}
                <div>
                  <label className="label">Username</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred.username, `user-${index}`)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3.5 font-mono text-lg tracking-[0.08em] text-[#f1f5f9] text-left active:scale-[0.98] transition-all hover:border-[#00d4ff]/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 break-all">{cred.username}</span>
                      <span className="text-xs font-sans tracking-normal flex-shrink-0 px-2 py-1 rounded transition-all duration-200"
                        style={{
                          background: copiedField === `user-${index}` ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.1)",
                          color: copiedField === `user-${index}` ? "#4ade80" : "#94a3b8",
                        }}
                      >
                        {copiedField === `user-${index}` ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </button>

                  {/* Save for quick login */}
                  <button
                    onClick={() => saveUsernameForLogin(cred.username)}
                    className={`mt-2 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors w-full sm:w-auto ${
                      savedUsername === cred.username
                        ? "bg-[#22c55e]/15 text-[#4ade80]"
                        : "bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={savedUsername === cred.username ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {savedUsername === cred.username ? "Saved for quick login" : "Save for quick login"}
                  </button>
                </div>

                {/* Password — tap to copy, show/hide toggle */}
                <div>
                  <label className="label">Password</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred.password, `pass-${index}`)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3.5 font-mono text-lg tracking-[0.15em] text-[#f1f5f9] text-left active:scale-[0.98] transition-all hover:border-[#00d4ff]/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 break-all">
                        {showPasswords[index] ? cred.password : "••••••••"}
                      </span>
                      <span className="text-xs font-sans tracking-normal flex-shrink-0 px-2 py-1 rounded transition-all duration-200"
                        style={{
                          background: copiedField === `pass-${index}` ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.1)",
                          color: copiedField === `pass-${index}` ? "#4ade80" : "#94a3b8",
                        }}
                      >
                        {copiedField === `pass-${index}` ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </button>

                  {/* Show/Hide toggle — labeled, full-width on mobile */}
                  <button
                    onClick={() => togglePassword(index)}
                    className="mt-2 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors w-full sm:w-auto"
                  >
                    {showPasswords[index] ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        Hide password
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Show password
                      </>
                    )}
                  </button>
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
    </div>
  );
}
