import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { generateTicketAutoReply } from "@/lib/ai";
import { sendSupportTicketNotification } from "@/lib/email";

// GET - List tickets for current customer
export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("customer_id", session.customerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Tickets fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, category, device_type, description } = await request.json();

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: "Subject, category, and description are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Create ticket
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        customer_id: session.customerId,
        subject,
        category,
        device_type: device_type || null,
        description,
        status: "open",
        priority: "normal",
      })
      .select()
      .single();

    if (error) {
      console.error("Ticket creation error:", error);
      return NextResponse.json(
        { error: "Failed to create ticket" },
        { status: 500 }
      );
    }

    // Add initial message
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_type: "customer",
      sender_name: session.name,
      message: description,
    });

    // Fire-and-forget AI auto-reply
    generateTicketAutoReply(ticket.id, session.customerId, {
      subject,
      category,
      device_type,
      description,
    }).catch((err) => console.error("AI auto-reply error:", err));

    // Fire-and-forget admin notification email
    sendSupportTicketNotification({
      customerName: session.name,
      customerEmail: session.email || '',
      ticketNumber: ticket.ticket_number,
      subject,
      category,
      description,
    }).catch((err) => console.error("Ticket notification email error:", err));

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Ticket creation error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
