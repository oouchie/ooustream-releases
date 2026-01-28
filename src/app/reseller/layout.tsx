"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [resellerName, setResellerName] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/reseller" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Ooustream
                </span>
                <span className="text-xs bg-[#22c55e] text-white px-2 py-0.5 rounded">
                  {resellerName}
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/reseller"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/reseller/customers"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Customers
                </Link>
                <Link
                  href="/reseller/customers/new"
                  className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  Add Customer
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#94a3b8] text-sm">
                Welcome, {resellerName}
              </span>
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
