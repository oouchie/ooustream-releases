import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

// GET - Get approved reviews (public, no auth required)
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("id, rating, review_text, display_name, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create review (auth required, one per customer)
export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, review_text, display_name } = await request.json();

    if (!rating || !review_text) {
      return NextResponse.json(
        { error: "Rating and review text are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (review_text.length > 500) {
      return NextResponse.json(
        { error: "Review must be under 500 characters" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if customer already has a review
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("customer_id", session.customerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a review" },
        { status: 409 }
      );
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        customer_id: session.customerId,
        rating,
        review_text: review_text.trim(),
        display_name: (display_name || session.name || "Customer")
          .trim()
          .substring(0, 50),
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Review creation error:", error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
