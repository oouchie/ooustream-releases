import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { buildCustomerContext, generateAIResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (messages.length > 20) {
      return NextResponse.json(
        {
          error:
            "Conversation too long. Please create a ticket for complex issues.",
        },
        { status: 400 }
      );
    }

    const customerContext = await buildCustomerContext(session.customerId);
    const response = await generateAIResponse(messages, customerContext);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);

    const message =
      error instanceof Error && error.message === "AI_OVERLOADED"
        ? "Our AI assistant is temporarily busy. Please try again in a moment, or create a support ticket and we'll get back to you quickly."
        : error instanceof Error && error.message === "AI_RATE_LIMITED"
          ? "Too many requests right now. Please wait a few seconds and try again."
          : "Something went wrong on our end. Please try again, or create a support ticket for help.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
