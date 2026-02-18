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
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
