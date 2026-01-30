"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-4 md:gap-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Ooustream
                </span>
                <span className="text-xs bg-[#6366f1] text-white px-2 py-0.5 rounded">
                  Admin
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/admin"
                  className={`transition-colors ${pathname === "/admin" ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/tickets"
                  className={`transition-colors ${pathname?.startsWith("/admin/tickets") ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Tickets
                </Link>
                <Link
                  href="/admin/announcements"
                  className={`transition-colors ${pathname?.startsWith("/admin/announcements") ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Announcements
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <a
                href={process.env.NEXT_PUBLIC_CRM_URL || "https://ooustream-crm.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-[#6366f1] hover:bg-[#5558e3] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden md:inline">Go to CRM</span>
                <span className="md:hidden">CRM</span>
              </a>
              <button
                onClick={handleLogout}
                className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-sm p-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="sm:hidden w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#334155] bg-[#1e293b]">
            <nav className="px-4 py-3 space-y-1">
              <Link
                href="/admin"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === "/admin"
                    ? "bg-[#6366f1] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/tickets"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname?.startsWith("/admin/tickets")
                    ? "bg-[#6366f1] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Tickets
              </Link>
              <Link
                href="/admin/announcements"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname?.startsWith("/admin/announcements")
                    ? "bg-[#6366f1] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Announcements
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_CRM_URL || "https://ooustream-crm.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to CRM
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}
