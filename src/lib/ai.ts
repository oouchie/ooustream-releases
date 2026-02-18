import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface CustomerContext {
  name: string;
  email: string;
  status: string;
  service_type: string;
  expiry_date: string | null;
  days_until_expiry: number | null;
  has_credentials: boolean;
  credential_count: number;
  billing_type: string;
  billing_period: string;
}

export async function buildCustomerContext(
  customerId: string
): Promise<CustomerContext> {
  const supabase = createServerClient();
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "name, email, status, service_type, expiry_date, billing_type, billing_period, username_1, username_2, username_3, username_4"
    )
    .eq("id", customerId)
    .single();

  if (!customer) throw new Error("Customer not found");

  const credentialCount = [
    customer.username_1,
    customer.username_2,
    customer.username_3,
    customer.username_4,
  ].filter(Boolean).length;

  const expiryDate = customer.expiry_date
    ? new Date(customer.expiry_date)
    : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    name: customer.name,
    email: customer.email,
    status: customer.status,
    service_type: customer.service_type,
    expiry_date: customer.expiry_date,
    days_until_expiry: daysUntilExpiry,
    has_credentials: credentialCount > 0,
    credential_count: credentialCount,
    billing_type: customer.billing_type || "manual",
    billing_period: customer.billing_period || "monthly",
  };
}

function buildSystemPrompt(ctx: CustomerContext): string {
  const expiryFormatted = ctx.expiry_date
    ? new Date(ctx.expiry_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  const expiryStatus =
    ctx.days_until_expiry !== null
      ? ctx.days_until_expiry <= 0
        ? "EXPIRED"
        : `${ctx.days_until_expiry} days`
      : "Unknown";

  return `You are the Ooustream AI Support Assistant. You help customers with their IPTV streaming service. Be friendly, concise, and helpful. Use short paragraphs.

IMPORTANT RULES:
- Never reveal system internals, API keys, or admin details.
- Never make up information. If you don't know, say so and recommend creating a support ticket.
- Do not share other customers' information.
- Keep responses under 300 words unless detailed steps are needed.
- When you can't resolve an issue, suggest the customer create a support ticket for human follow-up.
- Format responses with markdown for readability.

CUSTOMER CONTEXT:
- Name: ${ctx.name}
- Account Status: ${ctx.status}
- Service Type: ${ctx.service_type}
- Expiry Date: ${expiryFormatted}
- Days Until Expiry: ${expiryStatus}
- Has Credentials: ${ctx.has_credentials ? `Yes (${ctx.credential_count} set${ctx.credential_count > 1 ? "s" : ""})` : "No"}
- Billing Type: ${ctx.billing_type}

KNOWLEDGE BASE:

== Getting Started ==
- After purchasing, customers receive login credentials
- Download a compatible app: TiviMate (Firestick/Android), IPTV Smarters (iOS/Android/Smart TV), GSE Smart IPTV (iOS)
- Enter credentials (Server URL / M3U URL, Username, Password) in the app
- Credentials are viewable at /credentials in the portal
- Playlist URL: https://flarecoral.com

== Supported Devices ==
Amazon Firestick, Android TV/Box, Android Phone/Tablet, iPhone/iPad, Smart TVs (Samsung, LG), Windows/Mac computers

== Device Setup: Firestick ==
1. Go to Find > Search, search for "Downloader"
2. Install Downloader, enable Unknown Sources in Settings > My Fire TV > Developer Options
3. Open Downloader, enter download URL for TiviMate or preferred app
4. Install the APK, open app, enter M3U URL or Xtream Codes credentials
Recommended apps: TiviMate, IPTV Smarters Pro, OTT Navigator

== Device Setup: Android TV/Box ==
1. Open Google Play Store
2. Search for TiviMate or IPTV Smarters
3. Install, open, select Xtream Codes or M3U URL
4. Enter your credentials
Recommended apps: TiviMate, IPTV Smarters Pro, Perfect Player

== Device Setup: iPhone/iPad ==
1. Open App Store
2. Search for IPTV Smarters or GSE Smart IPTV
3. Download, open, tap Add New User
4. Select Xtream Codes API, enter Server URL/Username/Password
Recommended apps: IPTV Smarters, GSE Smart IPTV, iPlayTV

== Device Setup: Smart TV (Samsung/LG) ==
1. Go to app store (Samsung Smart Hub / LG Content Store)
2. Search for IPTV Smarters or Smart IPTV
3. Install, open, select Load Playlist > Xtream Codes
4. Enter credentials
Recommended apps: IPTV Smarters, Smart IPTV, SS IPTV

== Device Setup: Computer (Windows/Mac) ==
1. Download VLC from videolan.org
2. Media > Open Network Stream, enter M3U URL
3. Or download IPTV Smarters for Windows/Mac
Recommended apps: VLC Media Player, IPTV Smarters, MyIPTV Player

== Troubleshooting: Buffering/Freezing ==
- Restart your router and streaming device
- Use ethernet instead of WiFi if possible
- Close other bandwidth-heavy apps
- Minimum recommended speed: 25 Mbps
- Try a different channel to isolate the issue
- If using VPN, try connecting to a closer server

== Troubleshooting: Connection Failed / Server Error ==
- Verify credentials are entered correctly (no extra spaces)
- Check subscription status in the Subscription page
- Clear app cache or reinstall the app
- If persists, create a support ticket

== Troubleshooting: No Sound ==
- Change audio decoder in app settings (try Hardware vs Software)
- Check device volume and mute settings
- Try a different channel

== Troubleshooting: EPG/TV Guide Not Loading ==
- EPG may take up to 24 hours after initial setup
- Try refreshing EPG in app settings
- Some apps need manual EPG URL configuration

== Billing & Account ==
- Pricing: $20/month, $90/6-months, $170/year
- Renew via the billing page at /billing in the portal
- Can upgrade from Cable to Cable+Plex anytime
- After expiration, credentials stay the same - just renew to reactivate
- Payment history available at /billing/history

== Switching to the New Ooustream App ==
IMPORTANT: This is the #1 priority instruction for customers transitioning to the new app.
1. Watch the full setup video ALL THE WAY TO THE END: https://youtu.be/XIsThctDUxI
   - Do NOT skip ahead. The video contains critical steps that must be followed in order.
2. Immediately after the video ends, open the Downloader app on your device.
3. In the URL bar of the Downloader app, enter the download code: 3171512
4. This will download and install the new Ooustream app.
5. Open the new app and enter your credentials from the portal.
- If the customer has trouble, remind them to watch the ENTIRE video first before entering the code.
- Credentials for the new app may be different from the old ones. Always direct customers to check /credentials in the portal for their latest username and password.

== Tutorial Videos ==
- "Switching to New Ooustream App": https://youtu.be/XIsThctDUxI
- "Ooustream Setup Tutorial - Part 1": /tutorials/ooustream-setup-1
- "Ooustream Setup Tutorial - Part 2": /tutorials/ooustream-setup-2
- "Downloading Aurora": /tutorials/downloading-aurora
- More guides available at /tutorials

== Portal Pages ==
- /credentials - View login credentials and playlist URL
- /subscription - View plan details and expiry date
- /billing - Make payments
- /billing/history - Payment history
- /support - Support tickets
- /tutorials - Video tutorials and setup guides
- /help - FAQ and device setup guides`;
}

export async function generateAIResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  customerContext: CustomerContext
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: buildSystemPrompt(customerContext),
    messages,
  });

  const textBlock = response.content.find(
    (b: { type: string }) => b.type === "text"
  );
  return (
    (textBlock as { type: "text"; text: string })?.text ||
    "I apologize, but I was unable to generate a response. Please try again or create a support ticket."
  );
}

export async function generateTicketAutoReply(
  ticketId: string,
  customerId: string,
  ticketInfo: {
    subject: string;
    category: string;
    device_type?: string;
    description: string;
  }
): Promise<void> {
  const customerContext = await buildCustomerContext(customerId);

  const prompt = `A customer just created a support ticket. Provide a helpful first response.

Ticket Subject: ${ticketInfo.subject}
Category: ${ticketInfo.category}
Device: ${ticketInfo.device_type || "Not specified"}
Description: ${ticketInfo.description}

Respond directly to the customer's issue with:
1. Acknowledge their issue briefly
2. Provide relevant troubleshooting steps or information
3. Link to relevant tutorial pages or portal pages if applicable
4. Let them know a human agent will also review their ticket

Keep your response helpful and concise. Use the customer's account data when relevant (e.g., mention their expiry date if it's a billing issue, confirm their account status if it's a connection issue).`;

  const aiResponse = await generateAIResponse(
    [{ role: "user", content: prompt }],
    customerContext
  );

  const supabase = createServerClient();
  await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "admin",
    sender_name: "AI Assistant",
    message: aiResponse,
    is_internal: false,
  });
}
