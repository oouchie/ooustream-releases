import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { sendTicketReplyNotification } from "@/lib/email";

// POST - Send a reply to all open/in-progress tickets
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get all open and in-progress tickets with customer info
    const { data: tickets, error: ticketsError } = await supabase
      .from("support_tickets")
      .select(`
        id, subject, ticket_number, customer_id, status,
        customer:customers(id, name, email)
      `)
      .in("status", ["open", "in_progress"]);

    if (ticketsError) {
      return NextResponse.json({ error: ticketsError.message }, { status: 500 });
    }

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ success: true, replied: 0, message: "No open tickets found" });
    }

    let replied = 0;
    const errors: string[] = [];

    for (const ticket of tickets) {
      // Add message to ticket
      const { error: msgError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticket.id,
          sender_type: "admin",
          sender_name: "Support Team",
          message: message.trim(),
          is_internal: false,
        });

      if (msgError) {
        errors.push(`Ticket ${ticket.ticket_number}: ${msgError.message}`);
        continue;
      }

      // Update ticket status to in_progress if open
      if (ticket.status === "open") {
        await supabase
          .from("support_tickets")
          .update({ status: "in_progress", updated_at: new Date().toISOString() })
          .eq("id", ticket.id);
      } else {
        await supabase
          .from("support_tickets")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", ticket.id);
      }

      // Send email notification
      const customerData = ticket.customer as unknown as { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
      const customer = Array.isArray(customerData) ? customerData[0] : customerData;
      if (customer?.email) {
        sendTicketReplyNotification({
          customerEmail: customer.email,
          customerName: customer.name || "Customer",
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          subject: ticket.subject,
          replyMessage: message.trim(),
        }).catch((err) => console.error(`Email error for ticket ${ticket.ticket_number}:`, err));
      }

      replied++;
    }

    return NextResponse.json({
      success: true,
      replied,
      total: tickets.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk reply error:", error);
    return NextResponse.json(
      { error: "Failed to send bulk reply" },
      { status: 500 }
    );
  }
}
