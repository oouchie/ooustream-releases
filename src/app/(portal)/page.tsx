import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import Link from "next/link";

async function getCustomerData(customerId: string) {
  const supabase = createServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  // Get ticket count
  const { count: ticketCount } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .in("status", ["open", "in_progress", "waiting_customer"]);

  // Get announcements
  const { data: announcements } = await supabase
    .from("service_announcements")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", new Date().toISOString())
    .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(3);

  return { customer, ticketCount: ticketCount || 0, announcements: announcements || [] };
}

export default async function DashboardPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const { customer, ticketCount, announcements } = await getCustomerData(session.customerId);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">Error loading customer data</p>
      </div>
    );
  }

  // Calculate days until expiration (placeholder - actual logic depends on your data)
  const statusColors: Record<string, string> = {
    Active: "badge-active",
    Inactive: "badge-inactive",
    Expired: "badge-expired",
  };
  const statusColor = statusColors[customer.status as string] || "badge-inactive";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#f1f5f9]">
          Welcome back, {customer.name}!
        </h1>
        <p className="text-[#94a3b8] mt-1">
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border ${
                announcement.type === "outage"
                  ? "bg-[#ef4444]/10 border-[#ef4444]/30"
                  : announcement.type === "maintenance"
                  ? "bg-[#f59e0b]/10 border-[#f59e0b]/30"
                  : "bg-[#6366f1]/10 border-[#6366f1]/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    announcement.type === "outage"
                      ? "bg-[#ef4444]"
                      : announcement.type === "maintenance"
                      ? "bg-[#f59e0b]"
                      : "bg-[#6366f1]"
                  }`}
                />
                <div>
                  <h3 className="font-medium text-[#f1f5f9]">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8]">Account Status</p>
              <p className="text-2xl font-bold text-[#f1f5f9] mt-1">
                {customer.status}
              </p>
            </div>
            <span className={`badge ${statusColor}`}>{customer.status}</span>
          </div>
        </div>

        {/* Service Type */}
        <div className="card">
          <div>
            <p className="text-sm text-[#94a3b8]">Service Plan</p>
            <p className="text-2xl font-bold text-[#f1f5f9] mt-1">
              {customer.service_type}
            </p>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8]">Open Tickets</p>
              <p className="text-2xl font-bold text-[#f1f5f9] mt-1">
                {ticketCount}
              </p>
            </div>
            {ticketCount > 0 && (
              <Link
                href="/support"
                className="text-sm text-[#6366f1] hover:underline"
              >
                View
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/credentials" className="card card-hover text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#6366f1]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">View Credentials</h3>
            <p className="text-sm text-[#94a3b8] mt-1">Access your login info</p>
          </Link>

          <Link href="/support/new" className="card card-hover text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#22c55e]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">New Ticket</h3>
            <p className="text-sm text-[#94a3b8] mt-1">Get help with an issue</p>
          </Link>

          <Link href="/subscription" className="card card-hover text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#f59e0b]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">Subscription</h3>
            <p className="text-sm text-[#94a3b8] mt-1">View plan details</p>
          </Link>

          <Link href="/help" className="card card-hover text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#8b5cf6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">Help Center</h3>
            <p className="text-sm text-[#94a3b8] mt-1">FAQs & setup guides</p>
          </Link>
        </div>
      </div>

      {/* Tutorial Videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f1f5f9]">
            Tutorial Videos
          </h2>
          <Link href="/tutorials" className="text-sm text-[#6366f1] hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tutorials/getting-started" className="card card-hover group">
            <div className="aspect-video bg-[#1e293b] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20" />
              <svg className="w-12 h-12 text-[#6366f1] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">Getting Started</h3>
            <p className="text-sm text-[#94a3b8] mt-1">How to set up your IPTV service</p>
          </Link>

          <Link href="/tutorials/apps" className="card card-hover group">
            <div className="aspect-video bg-[#1e293b] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/20" />
              <svg className="w-12 h-12 text-[#22c55e] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">Recommended Apps</h3>
            <p className="text-sm text-[#94a3b8] mt-1">Best apps for your device</p>
          </Link>

          <Link href="/tutorials/troubleshooting" className="card card-hover group">
            <div className="aspect-video bg-[#1e293b] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/20 to-[#d97706]/20" />
              <svg className="w-12 h-12 text-[#f59e0b] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">Troubleshooting</h3>
            <p className="text-sm text-[#94a3b8] mt-1">Fix common streaming issues</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
