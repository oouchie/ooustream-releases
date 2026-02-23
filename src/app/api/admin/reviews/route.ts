import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

// GET - List all reviews (admin)
export async function GET() {
  try {
    const isAdmin = await verifyAdminAuth();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*, customer:customers(id, name, email, status)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Admin reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
