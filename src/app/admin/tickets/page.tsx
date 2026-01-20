"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SupportTicketWithCustomer, TICKET_STATUSES, TICKET_CATEGORIES } from "@/types";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/admin/tickets");
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true;
    if (filter === "open") return ticket.status === "open" || ticket.status === "in_progress";
    if (filter === "waiting") return ticket.status === "waiting_customer";
    if (filter === "closed") return ticket.status === "closed" || ticket.status === "resolved";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-[#22c55e]/20 text-[#22c55e]";
      case "in_progress":
        return "bg-[#6366f1]/20 text-[#6366f1]";
      case "waiting_customer":
        return "bg-[#f59e0b]/20 text-[#f59e0b]";
      case "resolved":
        return "bg-[#06b6d4]/20 text-[#06b6d4]";
      case "closed":
        return "bg-[#94a3b8]/20 text-[#94a3b8]";
      default:
        return "bg-[#94a3b8]/20 text-[#94a3b8]";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-[#ef4444]/20 text-[#ef4444]";
      case "high":
        return "bg-[#f59e0b]/20 text-[#f59e0b]";
      case "normal":
        return "bg-[#6366f1]/20 text-[#6366f1]";
      case "low":
        return "bg-[#94a3b8]/20 text-[#94a3b8]";
      default:
        return "bg-[#94a3b8]/20 text-[#94a3b8]";
    }
  };

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;
  const waitingCount = tickets.filter(
    (t) => t.status === "waiting_customer"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Support Tickets</h1>
          <p className="text-[#94a3b8] mt-1">Manage customer support requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded bg-[#22c55e]/20 text-[#22c55e]">
              {openCount} Open
            </span>
            <span className="px-2 py-1 rounded bg-[#f59e0b]/20 text-[#f59e0b]">
              {waitingCount} Waiting
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All Tickets" },
          { value: "open", label: "Open" },
          { value: "waiting", label: "Waiting on Customer" },
          { value: "closed", label: "Closed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-[#6366f1] text-white"
                : "bg-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[#94a3b8]">No tickets found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-[#1e293b]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Ticket
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#94a3b8]">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-[#1e293b]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="block"
                    >
                      <span className="text-xs font-mono text-[#6366f1]">
                        {ticket.ticket_number}
                      </span>
                      <p className="text-[#f1f5f9] font-medium mt-1 hover:text-[#6366f1] transition-colors">
                        {ticket.subject}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#f1f5f9]">
                      {ticket.customer?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#94a3b8]">
                      {TICKET_CATEGORIES[ticket.category as keyof typeof TICKET_CATEGORIES]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8]">
                    {new Date(ticket.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
