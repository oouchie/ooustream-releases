// Account-notification SMS (A2P campaign 2 — renewal/payment reminders, service
// notifications, account updates). Routes through the campaign-2 Messaging Service
// (TWILIO_BILLING_MESSAGING_SERVICE_SID) — NOT the login Messaging Service.
//
// COMPLIANCE: account-notification traffic must ride campaign 2's registered service.
// Until that campaign is registered and TWILIO_BILLING_MESSAGING_SERVICE_SID is set,
// every send is a safe no-op (skipped) — we deliberately do NOT fall back to the login
// sender, which would put non-compliant traffic on the approved login campaign.

type SendResult = { sent: boolean; skipped?: boolean; error?: string };

function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.length === 10) p = "1" + p;
  return "+" + p;
}

export async function sendAccountNotificationSMS(
  phone: string,
  body: string
): Promise<SendResult> {
  if (process.env.SMS_ENABLED !== "true") return { sent: false, skipped: true };

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_BILLING_MESSAGING_SERVICE_SID;

  // No campaign-2 service configured yet → skip (never fall back to the login sender).
  if (!accountSid || !authToken || !messagingServiceSid) {
    return { sent: false, skipped: true };
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formatPhone(phone),
          MessagingServiceSid: messagingServiceSid,
          Body: body,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { sent: false, error: err?.message || `Twilio ${res.status}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

// One-time confirmation when a customer opts in via the dashboard toggle.
export async function sendSmsConsentConfirmation(phone: string): Promise<SendResult> {
  return sendAccountNotificationSMS(
    phone,
    "OOUStream: you're opted in to account notification texts (renewal/payment reminders, service & account updates). Msg frequency varies. Msg&data rates may apply. Reply STOP to opt out, HELP for help."
  );
}

export type ReminderWindow = "7day" | "1day";

// Renewal/expiration reminder (A2P campaign 2). Copy mirrors the approved TCR
// sample: transactional, points to /billing, STOP/HELP. Routes through the
// campaign-2 Messaging Service via sendAccountNotificationSMS (safe no-op until
// TWILIO_BILLING_MESSAGING_SERVICE_SID is set).
export async function sendBillingReminderSMS(
  phone: string,
  expiryDate: string,
  reminderWindow: ReminderWindow
): Promise<SendResult> {
  // Format the date in ET to match what the customer sees in the portal.
  const when = new Date(`${expiryDate}T00:00:00-05:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const lead =
    reminderWindow === "1day"
      ? `your subscription expires tomorrow (${when})`
      : `your subscription expires on ${when}`;
  return sendAccountNotificationSMS(
    phone,
    `OOUStream: ${lead}. Manage your account: https://ooustream.com/billing Reply STOP to opt out, HELP for help.`
  );
}
