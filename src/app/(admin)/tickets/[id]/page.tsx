"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { SupportTicketWithCustomer, TicketMessage, TICKET_CATEGORIES, TICKET_STATUSES } from "@/types";

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicketWithCustomer | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}`);
      const data = await response.json();

      if (data.ticket) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
      } else {
        toast.error("Ticket not found");
        router.push("/admin/tickets");
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);

    try {
      const response = await fetch(`/api/admin/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText,
          is_internal: isInternal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setReplyText("");
        setIsInternal(false);
        toast.success(isInternal ? "Internal note added" : "Reply sent!");
      } else {
        toast.error(data.error || "Failed to send reply");
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status updated");
        fetchTicket();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        toast.success("Priority updated");
        fetchTicket();
      } else {
        toast.error("Failed to update priority");
      }
    } catch {
      toast.error("Failed to update priority");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-[#6366f1]">
                    {ticket.ticket_number}
                  </span>
                  <span className={`badge badge-${ticket.status.replace("_", "-")}`}>
                    {TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[#f1f5f9]">{ticket.subject}</h1>
                <p className="text-sm text-[#94a3b8] mt-2">
                  {TICKET_CATEGORIES[ticket.category as keyof typeof TICKET_CATEGORIES]}
                  {ticket.device_type && ` • ${ticket.device_type}`}
                  {" • "}
                  {new Date(ticket.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  msg.is_internal
                    ? "bg-[#f59e0b]/10 border border-[#f59e0b]/30"
                    : msg.sender_type === "customer"
                    ? "bg-[#6366f1]/10 border border-[#6366f1]/30 ml-8"
                    : msg.sender_type === "system"
                    ? "bg-[#334155] border border-[#475569] text-center text-sm"
                    : "bg-[#22c55e]/10 border border-[#22c55e]/30 mr-8"
                }`}
              >
                {msg.sender_type !== "system" && (
                  <div className="flex items-center gap-2 mb-2">
                    {msg.is_internal && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[#f59e0b]/20 text-[#f59e0b]">
                        Internal
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        msg.sender_type === "customer"
                          ? "text-[#6366f1]"
                          : "text-[#22c55e]"
                      }`}
                    >
                      {msg.sender_name}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <p
                  className={`whitespace-pre-wrap ${
                    msg.sender_type === "system" ? "text-[#94a3b8]" : "text-[#f1f5f9]"
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="card">
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Reply</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 rounded border-[#334155] bg-[#1e293b] text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                <span className="text-sm text-[#94a3b8]">Internal note</span>
              </label>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isInternal ? "Add internal note..." : "Type your reply..."}
              className="input min-h-[100px] resize-y mb-4"
              rows={4}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className={`btn ${isInternal ? "bg-[#f59e0b] hover:bg-[#d97706]" : "btn-primary"}`}
              >
                {sending ? (
                  <span className="spinner" />
                ) : isInternal ? (
                  "Add Note"
                ) : (
                  "Send Reply"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Customer</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#94a3b8]">Name</label>
                <p className="text-[#f1f5f9]">{ticket.customer?.name || "Unknown"}</p>
              </div>
              {ticket.customer?.email && (
                <div>
                  <label className="text-xs text-[#94a3b8]">Email</label>
                  <p className="text-[#f1f5f9]">{ticket.customer.email}</p>
                </div>
              )}
              {ticket.customer?.phone && (
                <div>
                  <label className="text-xs text-[#94a3b8]">Phone</label>
                  <p className="text-[#f1f5f9]">{ticket.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Control */}
          <div className="card">
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Status</h3>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="input w-full"
            >
              {Object.entries(TICKET_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Control */}
          <div className="card">
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Priority</h3>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="input w-full"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange("waiting_customer")}
                className="btn btn-secondary w-full text-sm"
                disabled={ticket.status === "waiting_customer"}
              >
                Mark Waiting on Customer
              </button>
              <button
                onClick={() => handleStatusChange("resolved")}
                className="btn btn-secondary w-full text-sm"
                disabled={ticket.status === "resolved"}
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                className="btn btn-secondary w-full text-sm"
                disabled={ticket.status === "closed"}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
