import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

// POST - Add reply to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify ticket ownership
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, status")
      .eq("id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Add message
    const { data: newMessage, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: id,
        sender_type: "customer",
        sender_name: session.name,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 }
      );
    }

    // Update ticket status if it was waiting for customer
    if (ticket.status === "waiting_customer") {
      await supabase
        .from("support_tickets")
        .update({ status: "open", updated_at: new Date().toISOString() })
        .eq("id", id);
    } else {
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
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
