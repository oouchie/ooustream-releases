"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [resellerName, setResellerName] = useState("");
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
      const res = await fetch("/api/auth/check-reseller");
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(true);
        setResellerName(data.reseller);
      } else {
        router.push("/reseller-login");
      }
    } catch {
      router.push("/reseller-login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/reseller-logout", { method: "POST" });
    router.push("/reseller-login");
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
      {/* Reseller Header */}
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

              <Link href="/reseller" className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Ooustream
                </span>
                <span className="text-xs bg-[#22c55e] text-white px-2 py-0.5 rounded">
                  {resellerName}
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/reseller"
                  className={`transition-colors ${pathname === "/reseller" ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/reseller/customers"
                  className={`transition-colors ${pathname === "/reseller/customers" ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Customers
                </Link>
                <Link
                  href="/reseller/customers/new"
                  className={`transition-colors ${pathname === "/reseller/customers/new" ? "text-[#f1f5f9]" : "text-[#94a3b8] hover:text-[#f1f5f9]"}`}
                >
                  Add Customer
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline text-[#94a3b8] text-sm">
                Welcome, {resellerName}
              </span>
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
                href="/reseller"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === "/reseller"
                    ? "bg-[#22c55e] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/reseller/customers"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === "/reseller/customers"
                    ? "bg-[#22c55e] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Customers
              </Link>
              <Link
                href="/reseller/customers/new"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === "/reseller/customers/new"
                    ? "bg-[#22c55e] text-white"
                    : "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"
                }`}
              >
                Add Customer
              </Link>
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
