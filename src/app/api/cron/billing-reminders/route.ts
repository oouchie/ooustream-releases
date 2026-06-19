import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  sendBillingReminderSMS,
  type ReminderWindow,
} from "@/lib/sms-notifications";

// Daily cron: SMS renewal/expiration reminders to opted-in customers.
// Scheduled in vercel.json (0 14 * * * = 10am ET). Idempotent via the
// sms_reminder_log claim — see CLAUDE.md "Phase 3".
//
// Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
// when CRON_SECRET is set. Manual runs may pass `?key=<ADMIN_PASSWORD>`.
//
// Gating: SMS_BILLING_REMINDERS_ENABLED must be 'true'. Even when enabled, the
// actual send is a safe no-op until TWILIO_BILLING_MESSAGING_SERVICE_SID is set
// (see sendAccountNotificationSMS).

export const maxDuration = 300;

// Windows: 1day = expiry in [today .. today+1]; 7day = expiry in [today+2 .. today+7].
// Range-based (not exact-day) so a skipped cron run still catches a customer the
// next day, while the log table guarantees one send per window per billing cycle.
const WINDOWS: { window: ReminderWindow; minOffset: number; maxOffset: number }[] = [
  { window: "1day", minOffset: 0, maxOffset: 1 },
  { window: "7day", minOffset: 2, maxOffset: 7 },
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth === `Bearer ${process.env.CRON_SECRET}`
  ) {
    return true;
  }
  const key = request.nextUrl.searchParams.get("key");
  if (key && process.env.ADMIN_PASSWORD && key === process.env.ADMIN_PASSWORD) {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.SMS_BILLING_REMINDERS_ENABLED !== "true") {
    return NextResponse.json({ ok: true, skipped: "disabled", sent: 0 });
  }

  const dryRun = request.nextUrl.searchParams.get("dry") === "1";
  const supabase = createServerClient();
  const today = new Date();

  let totalSent = 0;
  let totalSkippedNoSend = 0;
  const errors: { customerId: string; window: string; error: string }[] = [];
  const perWindow: Record<string, number> = {};

  for (const { window, minOffset, maxOffset } of WINDOWS) {
    const min = new Date(today);
    min.setUTCDate(min.getUTCDate() + minOffset);
    const max = new Date(today);
    max.setUTCDate(max.getUTCDate() + maxOffset);

    // Eligible: opted in, has a phone, NOT reseller-managed (those bill through
    // their reseller, not /billing), expiry inside this window.
    const { data: candidates, error: qErr } = await supabase
      .from("customers")
      .select("id, phone, expiry_date")
      .eq("sms_consent", true)
      .is("reseller", null)
      .not("phone", "is", null)
      .gte("expiry_date", isoDate(min))
      .lte("expiry_date", isoDate(max));

    if (qErr) {
      errors.push({ customerId: "-", window, error: qErr.message });
      continue;
    }

    perWindow[window] = 0;

    for (const c of candidates ?? []) {
      const phone = (c.phone ?? "").trim();
      if (!phone) continue;

      // Claim the (customer, cycle, window) slot BEFORE sending. ON CONFLICT DO
      // NOTHING -> a row is returned only if we won the claim; an empty result
      // means it was already sent this cycle. Race/duplicate-run safe.
      const { data: claimed, error: claimErr } = await supabase
        .from("sms_reminder_log")
        .upsert(
          { customer_id: c.id, expiry_date: c.expiry_date, reminder_window: window },
          { onConflict: "customer_id,expiry_date,reminder_window", ignoreDuplicates: true }
        )
        .select("id");

      if (claimErr) {
        errors.push({ customerId: c.id, window, error: claimErr.message });
        continue;
      }
      if (!claimed || claimed.length === 0) continue; // already sent this cycle

      if (dryRun) {
        // Roll back the claim so a dry run doesn't consume the slot.
        await supabase.from("sms_reminder_log").delete().eq("id", claimed[0].id);
        perWindow[window]++;
        totalSent++;
        continue;
      }

      const res = await sendBillingReminderSMS(phone, c.expiry_date, window);
      if (res.sent) {
        perWindow[window]++;
        totalSent++;
      } else {
        // Not delivered (skipped no-op or error) -> release the claim so a future
        // run retries once the sender is configured / transient error clears.
        await supabase.from("sms_reminder_log").delete().eq("id", claimed[0].id);
        if (res.skipped) {
          totalSkippedNoSend++;
        } else {
          errors.push({ customerId: c.id, window, error: res.error ?? "unknown" });
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    sent: totalSent,
    perWindow,
    skippedNoSend: totalSkippedNoSend, // sender not configured yet (safe no-op)
    errorCount: errors.length,
    errors: errors.slice(0, 25),
  });
}
