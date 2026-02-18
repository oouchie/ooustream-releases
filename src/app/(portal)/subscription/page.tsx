import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

async function getSubscriptionData(customerId: string) {
  const supabase = createServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  return customer;
}

export default async function SubscriptionPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const customer = await getSubscriptionData(session.customerId);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">Error loading subscription data</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Active: "badge-active",
    Inactive: "badge-inactive",
    Expired: "badge-expired",
  };
  const statusColor = statusColors[customer.status as string] || "badge-inactive";

  const statusBgs: Record<string, string> = {
    Active: "bg-[#22c55e]/10 border-[#22c55e]/30",
    Inactive: "bg-[#f59e0b]/10 border-[#f59e0b]/30",
    Expired: "bg-[#ef4444]/10 border-[#ef4444]/30",
  };
  const statusBg = statusBgs[customer.status as string] || "bg-[#f59e0b]/10 border-[#f59e0b]/30";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Subscription</h1>
        <p className="text-[#94a3b8] mt-1">
          View your plan details and renewal information
        </p>
      </div>

      {/* Status Card */}
      <div className={`card ${statusBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94a3b8]">Account Status</p>
            <p className="text-3xl font-bold text-[#f1f5f9] mt-1">
              {customer.status}
            </p>
          </div>
          <span className={`badge ${statusColor} text-lg px-4 py-2`}>
            {customer.status}
          </span>
        </div>
      </div>

      {/* Plan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
            Plan Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Service Type</span>
              <span className="font-medium text-[#f1f5f9]">
                {customer.service_type}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Account Name</span>
              <span className="font-medium text-[#f1f5f9]">{customer.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Email</span>
              <span className="font-medium text-[#f1f5f9]">{customer.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-[#94a3b8]">Phone</span>
              <span className="font-medium text-[#f1f5f9]">
                {customer.phone || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
            Account Info
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Member Since</span>
              <span className="font-medium text-[#f1f5f9]">
                {new Date(customer.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Last Updated</span>
              <span className="font-medium text-[#f1f5f9]">
                {new Date(customer.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]">
              <span className="text-[#94a3b8]">Expiration Date</span>
              <span className="font-medium text-[#f1f5f9]">
                {customer.expiry_date
                  ? new Date(customer.expiry_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-[#94a3b8]">Credentials</span>
              <span className="font-medium text-[#f1f5f9]">
                {[
                  customer.username_1,
                  customer.username_2,
                  customer.username_3,
                  customer.username_4,
                ].filter(Boolean).length}{" "}
                active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
          Renewal Information
        </h2>
        <div className="space-y-4">
          <p className="text-[#94a3b8]">
            To renew your subscription or upgrade your plan, please contact us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#6366f1]"
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
              </div>
              <div>
                <p className="text-sm text-[#94a3b8]">Email</p>
                <p className="font-medium text-[#f1f5f9]">info@ooustick.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#22c55e]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94a3b8]">Text/Call</p>
                <p className="font-medium text-[#f1f5f9]">(323) 539-7508</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {customer.status === "Expired" && (
        <div className="card bg-[#ef4444]/10 border-[#ef4444]/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#ef4444]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#f1f5f9]">
                Your subscription has expired
              </h3>
              <p className="text-sm text-[#94a3b8] mt-1">
                Please contact us to renew your subscription and restore access
                to your IPTV service.
              </p>
            </div>
          </div>
        </div>
      )}

      {customer.status === "Inactive" && (
        <div className="card bg-[#f59e0b]/10 border-[#f59e0b]/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#f59e0b]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#f1f5f9]">
                Your account is currently inactive
              </h3>
              <p className="text-sm text-[#94a3b8] mt-1">
                If you believe this is an error, please contact support for
                assistance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
