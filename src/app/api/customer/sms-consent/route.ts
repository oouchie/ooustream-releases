import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

// Customer self-service opt-in/out for the renewal reminders + service
// notifications SMS program (second A2P campaign — Account Notification).
// This is the live, end-user-initiated CTA that TCR vetting verifies.
export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const consent = body?.consent;
    if (typeof consent !== "boolean") {
      return NextResponse.json(
        { error: "consent (boolean) is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // A phone number must be on file for consent to mean anything.
    if (consent) {
      const { data: customer } = await supabase
        .from("customers")
        .select("phone")
        .eq("id", session.customerId)
        .single();
      if (!customer?.phone) {
        return NextResponse.json(
          { error: "No phone number on file. Contact support to add one." },
          { status: 422 }
        );
      }
    }

    const { error } = await supabase
      .from("customers")
      .update({
        sms_consent: consent,
        sms_consent_at: consent ? new Date().toISOString() : null,
      })
      .eq("id", session.customerId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preference" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, consent });
  } catch (error) {
    console.error("SMS consent update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
