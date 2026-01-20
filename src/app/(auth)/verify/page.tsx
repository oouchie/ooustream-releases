"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setError("Invalid login link");
      return;
    }

    // Verify the token
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          setStatus("error");
          setError(data.error || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("An error occurred during verification");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-8">
          Ooustream
        </h1>

        <div className="card">
          {status === "loading" && (
            <div className="py-8">
              <div className="spinner mx-auto mb-4" />
              <p className="text-[#94a3b8]">Verifying your login...</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#22c55e]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#f1f5f9] mb-2">
                Login Successful!
              </h2>
              <p className="text-[#94a3b8]">Redirecting to your dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#ef4444]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#f1f5f9] mb-2">
                Verification Failed
              </h2>
              <p className="text-[#ef4444] mb-4">{error}</p>
              <a href="/login" className="btn btn-primary">
                Try Again
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
