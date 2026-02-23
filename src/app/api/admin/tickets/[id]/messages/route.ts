import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { sendTicketReplyNotification } from "@/lib/email";

// POST - Add admin reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message, is_internal } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify ticket exists and get details for email notification
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, status, subject, ticket_number, customer_id")
      .eq("id", id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Add message
    const { data: newMessage, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: id,
        sender_type: "admin",
        sender_name: "Support Team",
        message: message.trim(),
        is_internal: is_internal || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 }
      );
    }

    // Update ticket status to in_progress if it was open (only for non-internal messages)
    if (!is_internal && ticket.status === "open") {
      await supabase
        .from("support_tickets")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", id);
    } else {
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    // Send email notification to customer (non-internal replies only)
    if (!is_internal && ticket.customer_id) {
      const { data: customer } = await supabase
        .from("customers")
        .select("name, email")
        .eq("id", ticket.customer_id)
        .single();

      if (customer?.email) {
        sendTicketReplyNotification({
          customerEmail: customer.email,
          customerName: customer.name || "Customer",
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          subject: ticket.subject,
          replyMessage: message.trim(),
        }).catch((err) => console.error("Ticket reply email error:", err));
      }
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Message add error:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
