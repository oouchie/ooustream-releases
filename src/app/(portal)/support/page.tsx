import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { TICKET_CATEGORIES, TICKET_STATUSES } from "@/types";
import AIChatWidget from "@/components/support/AIChatWidget";

async function getTickets(customerId: string) {
  const supabase = createServerClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return tickets || [];
}

export default async function SupportPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const tickets = await getTickets(session.customerId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Support Tickets</h1>
          <p className="text-[#94a3b8] mt-1">
            View and manage your support requests
          </p>
        </div>
        <Link href="/support/new" className="btn btn-primary">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Ticket
        </Link>
      </div>

      {/* AI Chat Assistant */}
      <AIChatWidget />

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#334155] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#94a3b8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#f1f5f9] mb-2">
            No tickets yet
          </h3>
          <p className="text-[#94a3b8] mb-6">
            Create a support ticket if you need help with your service
          </p>
          <Link href="/support/new" className="btn btn-primary">
            Create Your First Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="card card-hover block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#6366f1]">
                      {ticket.ticket_number}
                    </span>
                    <span
                      className={`badge badge-${ticket.status.replace("_", "-")}`}
                    >
                      {TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#f1f5f9] truncate">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {TICKET_CATEGORIES[ticket.category as keyof typeof TICKET_CATEGORIES]} &bull;{" "}
                    {new Date(ticket.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-[#94a3b8] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
