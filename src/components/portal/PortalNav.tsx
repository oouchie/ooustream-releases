"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Full nav for desktop
const desktopNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/credentials", label: "Credentials", icon: KeyIcon },
  { href: "/subscription", label: "Subscription", icon: CreditCardIcon },
  { href: "/billing", label: "Billing", icon: BillingIcon },
  { href: "/tutorials", label: "Tutorials", icon: PlayIcon },
  { href: "/support", label: "Support", icon: TicketIcon },
  { href: "/help", label: "Help", icon: QuestionIcon },
];

// Consolidated bottom tabs for mobile — 4 items, thumb-reachable
const mobileTabItems = [
  { href: "/credentials", label: "Credentials", icon: KeyIcon },
  { href: "/tutorials", label: "Learn", icon: PlayIcon, matchAlso: ["/help"] },
  { href: "/support", label: "Support", icon: TicketIcon },
  { href: "/dashboard", label: "Account", icon: UserIcon, matchAlso: ["/subscription", "/billing"] },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  );
}

function BillingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

export default function PortalNav({ customerName }: { customerName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isDesktopActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const isMobileActive = (item: typeof mobileTabItems[number]) => {
    if (pathname === item.href || pathname.startsWith(item.href)) return true;
    return item.matchAlso?.some((p) => pathname === p || pathname.startsWith(p)) ?? false;
  };

  return (
    <>
      {/* ─── Top Header Bar ─────────────────────────────────────────────── */}
      <nav className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/credentials" className="flex items-center gap-2">
              <img
                src="/logo-full-on-dark.png"
                alt="Ooustream"
                className="h-10 md:h-12 w-auto"
              />
            </Link>

            {/* Desktop Nav — full 7-item horizontal */}
            <div className="hidden md:flex items-center gap-1">
              {desktopNavItems.map((item) => {
                const active = isDesktopActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                        : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a24]"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-[#94a3b8] truncate max-w-[140px]">
                {customerName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-[#94a3b8] hover:text-[#ef4444] transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Bottom Tab Bar ──────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#12121a] border-t border-[#2a2a3a]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch">
          {mobileTabItems.map((item) => {
            const active = isMobileActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors ${
                  active
                    ? "text-[#00d4ff]"
                    : "text-[#64748b] active:text-[#94a3b8]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                    style={{ background: "#00d4ff", boxShadow: "0 0 8px rgba(0,212,255,0.5)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
