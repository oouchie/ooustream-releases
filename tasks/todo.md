# Phase 3 — SMS Payment/Renewal Reminders (Twilio campaign 2 approved)

Goal: daily cron texts customers whose subscription is expiring, gated + idempotent.

## Decisions
- **Sender**: reuse `sendAccountNotificationSMS` (routes via `TWILIO_BILLING_MESSAGING_SERVICE_SID`). Until that env is set, every send is a safe no-op — so this can ship gated-off.
- **Windows**: `7day` = expiry in today+2..today+7; `1day` = expiry in today..today+1. Range-based so a missed cron day still catches them.
- **Audience**: `sms_consent = true` AND phone present AND **`reseller IS NULL`**. Reseller-managed customers pay their reseller, not via `/billing`, so a portal billing link would mislead them. ⚠️ FLAG to user — flip if they want resellers included.
- **Idempotency**: new table `sms_reminder_log` unique on `(customer_id, expiry_date, window)`. Claim-then-send; delete claim on send failure so it retries.
- **Gating**: `SMS_BILLING_REMINDERS_ENABLED` (default off) + existing `SMS_ENABLED`. Cron auth via `Bearer CRON_SECRET` (Vercel) or `?key=ADMIN_PASSWORD` (manual).
- **Copy**: matches approved TCR sample (transactional, STOP/HELP).

## Tasks
- [ ] Migration `005_sms_billing_reminders.sql` — `sms_reminder_log` table + unique index
- [ ] Apply migration to Supabase
- [ ] `sendBillingReminderSMS(phone, expiryDate, window)` in `src/lib/sms-notifications.ts`
- [ ] `GET /api/cron/billing-reminders/route.ts` — auth, gate, query, claim, send, tally
- [ ] `vercel.json` — daily cron `0 14 * * *` (10am ET)
- [ ] Update CLAUDE.md (Phase 3 done) + env var docs (`SMS_BILLING_REMINDERS_ENABLED`, `CRON_SECRET`)
- [ ] Build check (`npm run build` / typecheck)

## Owner action (blocks GO-LIVE, not the build)
- [ ] Capture campaign-2 Messaging Service SID + dedicated number -> set `TWILIO_BILLING_MESSAGING_SERVICE_SID` on Vercel Production
- [ ] Set `SMS_BILLING_REMINDERS_ENABLED=true` + `CRON_SECRET` on Vercel Production
