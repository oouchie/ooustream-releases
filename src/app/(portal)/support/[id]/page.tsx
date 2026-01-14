"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { SupportTicket, TicketMessage, TICKET_CATEGORIES, TICKET_STATUSES } from "@/types";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${id}`);
      const data = await response.json();

      if (data.ticket) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);

    try {
      const response = await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setReplyText("");
        toast.success("Reply sent!");
      } else {
        toast.error(data.error || "Failed to send reply");
      }
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });

      if (response.ok) {
        toast.success("Ticket closed");
        fetchTicket();
      }
    } catch {
      toast.error("Failed to close ticket");
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
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444] mb-4">Ticket not found</p>
        <Link href="/support" className="btn btn-primary">
          Back to Tickets
        </Link>
      </div>
    );
  }

  const isOpen = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        href="/support"
        className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Tickets
      </Link>

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
          {isOpen && (
            <button
              onClick={handleCloseTicket}
              className="btn btn-secondary text-sm"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.sender_type === "customer"
                ? "bg-[#6366f1]/10 border border-[#6366f1]/30 ml-8"
                : msg.sender_type === "system"
                ? "bg-[#334155] border border-[#475569] text-center text-sm"
                : "bg-[#1e293b] border border-[#334155] mr-8"
            }`}
          >
            {msg.sender_type !== "system" && (
              <div className="flex items-center gap-2 mb-2">
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
      {isOpen ? (
        <form onSubmit={handleSendReply} className="card">
          <label className="label">Reply</label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            className="input min-h-[100px] resize-y mb-4"
            rows={4}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="btn btn-primary"
            >
              {sending ? <span className="spinner" /> : "Send Reply"}
            </button>
          </div>
        </form>
      ) : (
        <div className="card bg-[#334155] text-center">
          <p className="text-[#94a3b8]">
            This ticket is closed. Create a new ticket if you need further
            assistance.
          </p>
          <Link href="/support/new" className="btn btn-primary mt-4">
            Create New Ticket
          </Link>
        </div>
      )}
    </div>
  );
}
