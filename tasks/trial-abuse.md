# Trial Abuse Prevention — Core (Phase 1)

Goal: stop people farming multiple 24-hour free trials, using **multiple layered signals** beyond email/name/phone, with a risk-scored decision.

## Decisions locked
- **Trial length:** 24 hours
- **Card required:** yes (Stripe $0 SetupIntent → card fingerprint) — *Phase 2*
- **Panel access:** reseller-only → cannot bind device ID at panel; use **browser fingerprint** instead — *Phase 2*

## Phase 1 — Core (this pass, no external accounts) ✅ DONE
- [x] `supabase/migrations/004_trial_abuse.sql` — `trials` table + indexes on every dedup signal
- [x] `src/lib/trial-abuse.ts` — pure, dependency-free:
  - [x] `normalizeEmail()` — lowercase, Gmail dot/`+tag` stripping
  - [x] `isDisposableEmail()` — disposable-domain blocklist
  - [x] `normalizePhone()` — E.164 (US default)
  - [x] `scoreTrialRisk()` — weighted scoring + decision (active/review/denied)
  - [x] `checkTrialEligibility()` — queries prior trials for signal matches
  - [x] `createTrial()` — inserts the decided trial row (24h expiry)
- [x] Verify normalization + scoring (10/10 logic tests pass; full project `tsc` = 0 errors)
- [ ] **Owner action:** run `004_trial_abuse.sql` in Supabase SQL Editor (MCP OAuth broken)

## Phase 2 — Layering ✅ BUILT (pending owner go-live actions)
- [x] Stripe SetupIntent (no charge) → card fingerprint read SERVER-SIDE into eligibility (`createTrialSetupIntent`/`getTrialCardFingerprint` in `src/lib/stripe.ts`)
- [x] FingerprintJS visitorId on signup page (OSS `@fingerprintjs/fingerprintjs`, no account)
- [x] Twilio Lookup VOIP detection (`src/lib/twilio-lookup.ts`, flag `TWILIO_LOOKUP_ENABLED`, fail-open)
- [x] Public trial signup page `/trial` (+ layout) — Stripe Elements + FingerprintJS
- [x] API routes: `POST /api/trial/setup-intent`, `POST /api/trial`
- [x] Shared `provisionTrialCustomer` (`src/lib/trial-provision.ts`) — 24h customer row
- [x] Admin review queue `/admin/trials` + `GET/PATCH /api/admin/trials[/[id]]` + nav links
- [x] Sitemap + CLAUDE.md + canonical
- [x] `tsc` clean + production build passes (`/trial` static, API routes compiled)
- [ ] IP reputation / VPN flag (IPQualityScore) — deferred (optional; IP-reuse signal already wired)

### Owner go-live actions (code ready, NOT done — feature is dormant-safe until then)
- [ ] Run `supabase/migrations/004_trial_abuse.sql` in Supabase SQL editor (table verified ABSENT). Until then every trial fails SAFE → `review`.
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (= pk_live value) to Vercel Prod + Preview/Dev (else Elements won't mount).
- [ ] (Optional) `TWILIO_LOOKUP_ENABLED=true` after confirming the paid Lookup add-on is provisioned.
- [ ] Link `/trial` from landing-page CTA when ready to launch.

## Phase 2 adversarial review + hardening (2026-06-14)
Ran a 4-dimension review (correctness/security/abuse-bypass/integration), 17 findings, each double-verified → **8 confirmed**. Fixed:
- **Card fingerprint required** (was the critical fail-open): `/api/trial` now 400s if a confirmed SetupIntent yields no fingerprint — the spine signal can't be silently dropped.
- **DB-enforced dedup** (race + replay proof): added partial unique indexes on `card_fingerprint`/`email_normalized` (live statuses only) + unique `setup_intent_id`; `createTrial` returns a conflict-aware result; `/api/trial` **records the trial before provisioning** and treats a conflict as a hard deny. Closes the TOCTOU concurrent-card race and SetupIntent replay.
- **No silent createTrial failure**: active path checks the result; rolls back the trial row if provisioning then fails (retryable).
- **Spoof-resistant IP**: `getClientIp` now prefers `x-vercel-forwarded-for`/`x-real-ip` over the forgeable left-most `x-forwarded-for`.
- Dismissed (false positives / intentional): manual provisioning, fail-safe-to-review, ip_asn unused (reserved), non-Gmail sub-addressing (acceptable), admin-approve-bypasses-checks (by design — human override).
- Re-verified: `tsc` 0 errors, production build passes, 10/10 logic tests.

## Review — Phase 1 complete (2026-06-14)
- **Schema:** `trials` table records every ATTEMPT (incl. denials) so each attempt
  becomes a signal. Indexed on email_normalized, phone_normalized, card_fingerprint,
  browser_visitor_id, ip_address, status.
- **Library:** `src/lib/trial-abuse.ts` — pure, zero new deps. Hard-deny on reused
  card fingerprint or normalized email; weighted score (phone 50, browser 40, IP 15,
  disposable 30, VOIP/VPN 25) → review ≥45, deny ≥70. Fails SAFE (→ review) if the DB
  check errors, so an outage can't auto-approve abuse.
- **Verified:** 10/10 normalization/phone logic tests pass; full project `tsc` = 0 errors.
- **Not done (correct):** no commit/push yet; no public route/UI; Stripe/Fingerprint/
  Twilio/IP-reputation are Phase 2.
- **Owner action required:** run `supabase/migrations/004_trial_abuse.sql` in the
  Supabase SQL Editor before the route can read/write `trials`.
