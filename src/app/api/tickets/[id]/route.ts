import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

// GET - Get ticket details with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Get messages (non-internal only for customers)
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });

    return NextResponse.json({ ticket, messages: messages || [] });
  } catch (error) {
    console.error("Ticket fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket (close/reopen)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();
    const supabase = createServerClient();

    // Verify ownership
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Customers can only close tickets
    if (status !== "closed" && status !== "open") {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update ticket" },
        { status: 500 }
      );
    }

    // Add system message
    await supabase.from("ticket_messages").insert({
      ticket_id: id,
      sender_type: "system",
      sender_name: "System",
      message:
        status === "closed"
          ? `Ticket closed by ${session.name}`
          : `Ticket reopened by ${session.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ticket update error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
