import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: customer, error } = await supabase
      .from("customers")
      .select(
        "username_1, password_1, username_2, password_2, username_3, password_3, username_4, password_4, service_type"
      )
      .eq("id", session.customerId)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Build credentials array (only include non-empty credentials)
    const credentials = [];

    if (customer.username_1 && customer.password_1) {
      credentials.push({
        username: customer.username_1,
        password: customer.password_1,
        label: customer.service_type === "Cable/Plex" ? "Cable" : customer.service_type,
      });
    }

    if (customer.username_2 && customer.password_2) {
      credentials.push({
        username: customer.username_2,
        password: customer.password_2,
        label: customer.service_type === "Cable/Plex" ? "Plex" : "Secondary",
      });
    }

    if (customer.username_3 && customer.password_3) {
      credentials.push({
        username: customer.username_3,
        password: customer.password_3,
        label: "Additional",
      });
    }

    if (customer.username_4 && customer.password_4) {
      credentials.push({
        username: customer.username_4,
        password: customer.password_4,
        label: "Extra",
      });
    }

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("Credentials fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}
