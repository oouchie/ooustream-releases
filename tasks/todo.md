# SMS Billing/Renewal Reminders — Second A2P Campaign

Goal: send subscription renewal/expiry reminders by SMS, compliantly, WITHOUT
touching the approved login-only campaign (MGee134cc169169e8ed8e9eb45c3a762ba).

## Hard constraints (verified)
- A2P: 1 Messaging Service = 1 campaign; 1 phone number = 1 Messaging Service.
  → Second campaign REQUIRES a second Messaging Service + a second phone number.
  → Cannot reuse +16786806598 (bound to the login service).
- TCR vetting checks a LIVE, end-user-initiated opt-in (CTA) on the public site
  + a sample message that matches the registered use case.
- Use case = Account Notification (NOT Marketing/Mixed).

## Phase 1 — Code that must be LIVE before vetting  (DONE — build passes)
- [x] Customer opt-in toggle `SmsConsentToggle` on /dashboard → POST
      /api/customer/sms-consent → writes sms_consent + sms_consent_at (requires phone).
- [x] Dedicated public terms page /sms-alerts (separate from login-only /sms) covering
      renewal reminders + service notifications; cross-linked from /sms, /privacy, sitemap.
- [x] Fixed reseller sms_consent label (new + [id]/edit): removed "login credentials".
- [x] Privacy §3 rewritten: two programs, removed "login credentials delivery".
- [x] Added /sms-alerts to sitemap + CLAUDE.md (routes, SEO, canonical list).
- [x] Drafted TCR campaign-2 copy (description/CTA/samples) in CLAUDE.md.

## Phase 2 — Manual in Twilio Console + TCR  (you)
- [ ] Provision a 2nd phone number.
- [ ] Create a 2nd Messaging Service; add the new number to its sender pool.
- [ ] Register a 2nd A2P campaign (Account Notification) under the existing brand.
- [ ] Attach campaign to the 2nd Messaging Service. Await approval.
- [ ] Capture 2nd Messaging Service SID → env TWILIO_BILLING_MESSAGING_SERVICE_SID.

## Phase 3 — Code after approval
- [ ] `sendBillingReminderSMS` routed via TWILIO_BILLING_MESSAGING_SERVICE_SID.
- [ ] Daily cron (vercel.json) → customers with expiry_date in {7d, 1d} window
      AND sms_consent=true; send once per window (dedupe via sent-marker).
- [ ] Gate behind SMS_BILLING_REMINDERS_ENABLED flag (default off).
- [ ] Update CLAUDE.md: second campaign, env vars, cron, scope notes.

## Open decisions (need answers before building Phase 1)
1. Opt-in toggle location: /dashboard vs a new /account preferences page?
2. Reminder schedule: 7-day + 1-day before expiry? other cadence?
3. Draft the TCR registration copy (description/sample/CTA) now?

## Review
Phase 1 shipped & build-verified (npm run build clean, tsc clean):
- New: src/app/api/customer/sms-consent/route.ts, src/components/portal/SmsConsentToggle.tsx,
  src/app/sms-alerts/page.tsx
- Edited: dashboard/page.tsx, sms/page.tsx, privacy/page.tsx, sitemap.ts,
  reseller/customers/new + [id]/edit, CLAUDE.md, .env.local, src/lib/magic-link.ts
- NOT done (blocked on approval): Phase 2 (manual Twilio/TCR), Phase 3 (send fn + cron).
- NOT verified live: the toggle's write path against the real DB (no logged-in session
  tested this session); recommend a manual smoke test after deploy.
