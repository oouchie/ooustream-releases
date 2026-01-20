"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check-admin");
      if (res.ok) {
        setAuthenticated(true);
      } else {
        router.push("/admin-login");
      }
    } catch {
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Admin Header */}
      <header className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Ooustream
                </span>
                <span className="text-xs bg-[#6366f1] text-white px-2 py-0.5 rounded">
                  Admin
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/admin"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/tickets"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Tickets
                </Link>
                <Link
                  href="/admin/announcements"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Announcements
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={process.env.NEXT_PUBLIC_CRM_URL || "https://oostream-crm.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to CRM
              </a>
              <button
                onClick={handleLogout}
                className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
