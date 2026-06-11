# OOUStream Portal

Customer-facing portal, landing page, and reseller management system.

## Tech Stack
- Next.js 16 (App Router)
- Supabase (shared with CRM)
- Stripe (payments)
- SendGrid (email)
- Anthropic Claude API (AI support chat)
- JWT (customer sessions)
- Tailwind CSS v4
- Framer Motion 12 (animations)
- GSAP + @gsap/react (scroll-linked transforms, future use)

## Design
- **Primary color**: Cyan #00d4ff
- **Secondary color**: Purple #7c3aed
- **Background**: Near-black #0a0a0f
- **Surface**: #12121a, #1a1a24, #22222e
- **Fonts**: Space Grotesk (headings), JetBrains Mono (code/credentials)
- Dark theme with glow effects, grain noise texture

## Project Structure

### Landing Page (`src/app/page.tsx`)
Public-facing marketing page with:
- **Channel Wall** — 70 real channel names in scroll-parallax grid behind hero (RAF-driven, no React re-renders)
- **Channel Marquee** — two-row infinite CSS scroll of channel pills with live dots, pause-on-hover
- **Hero** — "10,000 Live Channels. One App. Every Device." with word-by-word reveal, trust pills
- **Magnetic Nav** — pointer-tracked spring-pull nav links (desktop only, degrades gracefully on touch)
- **Scroll Progress Bar** — cyan→purple gradient at header bottom (desktop only)
- **Bento Features** — 2 hero cards + 4 standard with pointer-tracked spotlight radial gradient
- **App Showcase** — 3D perspective TV frame with pointer tilt (mouse only), floor reflection, scroll-scrubbed video (desktop) / autoplay loop (mobile)
- **Pricing** — animated savings pill (AnimatedCounter), pathLength-drawn checkmarks, period switcher
- **How It Works** — 3-step connector with drawing line
- **Testimonials** — fetched from Supabase reviews
- **Contact Form** — sends to API

### Animation Components (`src/components/motion.tsx`)
- `MotionReveal` — viewport-triggered fade+slide
- `MotionStagger` / `MotionStaggerChild` — orchestrated stagger reveals
- `AnimatedCounter` — count-up with easing
- `MagneticLink` — pointer-tracked spring translate (desktop)
- `ScrollProgressBar` — scroll-linked scaleX with spring

### Portal Navigation (`src/components/portal/PortalNav.tsx`)
- **Desktop**: top header with full 7-item horizontal nav
- **Mobile**: fixed bottom tab bar with 4 tabs (Credentials, Learn, Support, Account)
- `env(safe-area-inset-bottom)` for notched iPhones
- Active tab indicator (cyan dot + glow)

## Portals

### Customer Portal (/)
- Magic link login (email/SMS)
- Username lookup login
- Login redirects to `/credentials` (customer's #1 need)
- View subscription status
- **Credentials page** — tap-to-copy fields with inline "Copied!" feedback, large monospace text with wide letter-spacing for TV remote entry, labeled action buttons, "Email My Credentials" above cards
- **Expiry date with countdown** (days remaining, color-coded warnings)
- **Billing page** - Pay via Stripe Checkout
- Payment history
- Support tickets
- Tutorial videos (YouTube embeds)
- Help / FAQ with tappable links

### Admin Portal (/admin)
- Password: `ADMIN_PASSWORD` env var
- Manage support tickets
- Create announcements
- View stats
- Link to CRM

### Reseller Portal (/reseller)
- Shun: password `shun2024`
- Prime: password `prime2024`
- JK: password `jk2024`
- Evan: password `evan2024`
- Dashboard with their customer stats
- Full customer management (add, edit, view)
- **Set billing settings and custom pricing**
- Send credentials and portal access emails
- Only see their own customers

## Payment System
- **Stripe Checkout** for payments
- **Plans**:
  - **Standard** (2 connections): $20/month, $90/6-months, $170/year
  - **Pro** (4 connections / multiview): $35/month, $175/6-months, $335/year
- **Custom pricing**: Resellers can set discounted prices per customer
- **Billing types**: Auto-renew (subscription) or Manual (one-time)
- **Webhook**: `/api/webhooks/stripe` handles payment completion
- **Direct Pro checkout**: `/subscribe/pro` for in-app links
- **Billing blocker**: Customers with a `reseller` value (non-null) CANNOT access the billing page or make payments. To enable portal payments for a reseller customer, set `reseller` to `null` in the `customers` table. The checkout API (`/api/payments/checkout`) also enforces this check.
- **Required fields for billing**: `plan_type` (standard/pro), `billing_period` (monthly/6month/yearly), `billing_type` (manual/auto). Optional: `custom_price_monthly`, `custom_price_6month`, `custom_price_yearly` (integer cents, overrides default pricing). `stripe_customer_id` auto-populates on first payment.
- **Stored `stripe_customer_id` is self-healing**: `getOrCreateStripeCustomer` (`src/lib/stripe.ts`) verifies the stored ID via `stripe.customers.retrieve()` before reuse. On `resource_missing` (stale ID from a prior Stripe account) or soft-deleted customer, it creates a fresh one and the checkout route persists the new ID back to Supabase. Rotating Stripe accounts no longer bricks existing customers.

## Webhook URL must be the apex domain (no `www`, no trailing slash)
Register the Stripe webhook at **`https://ooustream.com/api/webhooks/stripe`** — bare apex, no `www`, no trailing slash. The `www.ooustream.com` host **307-redirects** to the apex, the trailing-slash form **308-redirects**, and `http://` likewise. **Stripe does not follow 3xx redirects** — it marks the delivery failed and the handler never runs (symptom: payment succeeds in Stripe but NO `customers` row, NO `audit_logs` entry, NO welcome/admin email). Diagnose by checking the failed delivery's HTTP status in Stripe → Webhooks: `307`/`308` = wrong URL (redirect), `400` = signing-secret mismatch, `500` = handler threw. A bare `curl -X POST` to the correct apex URL should return **400 "No signature"** (proves it reaches the handler). Root-caused 2026-06-08: webhook had been registered with `www.`, silently dropping every payment.

**Note: this redirect is a Vercel *domain-level* redirect (`server: Vercel`, fires at the edge before any function/middleware runs) — it CANNOT be fixed in `middleware.ts`/`next.config.ts`. The safeguard is detection, not interception.**

**Webhook health check:** `GET /api/admin/webhook-health?key=<ADMIN_PASSWORD>` (`src/app/api/admin/webhook-health/route.ts`) calls `stripe.webhookEndpoints.list()` and flags any registered endpoint that uses `www.`, a trailing slash, `http://`, is disabled, or is missing a required event — plus whether `STRIPE_WEBHOOK_SECRET` is set. Returns `{ ok: boolean, issues: [...] }`. **Run this after any Stripe webhook/account change** to confirm you didn't reintroduce the redirect bug.

## Stripe Account / Key Rotation
If you ever rotate Stripe accounts (new `sk_live_...`, `pk_live_...`, `whsec_...`):
1. Update the three env vars on Vercel (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) in Production + Development. Preview requires a specific git branch.
2. Register the webhook endpoint in the new Stripe account at `https://ooustream.com/api/webhooks/stripe` (apex — see the "Webhook URL" note above) with events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`. Copy the new `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Redeploy production so the new lambda picks up the new env vars.
4. Existing customers in `customers.stripe_customer_id` hold IDs scoped to the OLD account. The self-healing logic handles this on each customer's next checkout — no manual DB cleanup needed.
5. If Stripe says "Your account cannot currently make live charges" after activation, hit `/api/admin/stripe-status?key=<ADMIN_PASSWORD>` to see `charges_enabled`, `capabilities`, and `requirements` — definitive source of truth vs the dashboard.

## Environment Variables
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_PASSWORD=oostream2024
SENDGRID_API_KEY=
EMAIL_FROM=Ooustream <oouchie@ooustream.com>
NEXT_PUBLIC_PORTAL_URL=https://ooustream.com
NEXT_PUBLIC_CRM_URL=https://ooustream-crm.vercel.app
ANTHROPIC_API_KEY=
RESELLER_SHUN_PASSWORD=shun2024
RESELLER_PRIME_PASSWORD=prime2024
RESELLER_JK_PASSWORD=jk2024
RESELLER_EVAN_PASSWORD=evan2024
SMS_ENABLED=false
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_MESSAGING_SERVICE_SID=MG...   # A2P campaign is attached here; send routes through this

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Routes

### Public
- `/` — Landing page (marketing)
- `/best-iptv-service` — SEO landing page
- `/blog` — Blog index (list of all posts)
- `/blog/[slug]` — Individual blog post
- `/subscribe/pro` — Direct Pro plan checkout (for in-app links)
- `/privacy` — Privacy policy
- `/terms` — Terms of service
- `/sms` — SMS messaging terms & opt-in page (A2P 10DLC CTA proof; login-text program only)
- `/sms-alerts` — SMS terms for the account-notifications program: renewal & payment reminders, service notifications, account updates (CTA proof for the 2nd A2P campaign; opt-in is the `/dashboard` toggle)

### Auth
- `/login` — Customer login (magic link or username)
- `/verify` — Magic link verification
- `/admin-login` — Admin password login
- `/reseller-login` — Reseller login (select reseller + password)

### Customer (protected)
- `/dashboard` — Status, expiry, quick actions (includes Billing link)
- `/subscription` — Account status and plan details
- `/billing` — Make payment via Stripe
- `/billing/history` — Payment history
- `/billing/success` — Payment success page
- `/billing/cancel` — Payment cancelled page
- `/credentials` — View login credentials (default landing after login)
- `/support` — Ticket list
- `/support/new` — Create ticket (progressive disclosure)
- `/support/[id]` — View ticket
- `/help` — FAQ and device setup guides
- `/tutorials` — Video tutorials (YouTube embeds)
- `/tutorials/[id]` — Individual tutorial

### Admin (protected)
- `/admin` — Dashboard
- `/admin/tickets` — All support tickets
- `/admin/tickets/[id]` — Ticket detail
- `/admin/announcements` — Manage announcements

### Reseller (protected)
- `/reseller` — Dashboard with stats
- `/reseller/customers` — Customer list (filtered to their reseller)
- `/reseller/customers/new` — Add customer (auto-tagged with reseller)
- `/reseller/customers/[id]` — View customer + send buttons
- `/reseller/customers/[id]/edit` — Edit customer

## SEO
- Sitemap at `/sitemap.xml` (homepage, best-iptv-service, blog, blog posts, subscribe/pro, login, sms, sms-alerts, privacy, terms)
- Robots at `/robots.txt` (disallows /api/, /admin/, /reseller/)
- Metadata with canonical URLs on all public pages
- OpenGraph + Twitter cards
- JSON-LD: Organization + WebSite schema (root layout) + Article schema (per blog post)
- `application-name` meta tag for Google site name

### Canonical URL pattern (IMPORTANT)
The root `src/app/layout.tsx` declares `alternates.canonical: "https://ooustream.com"` for the homepage. In Next.js App Router, child pages **inherit** the parent canonical unless they declare their own. **Every public, indexable page MUST declare its own `alternates.canonical`** — otherwise it tells Google the homepage is its canonical and Google skips indexing it ("Discovered – currently not indexed").

Where canonicals are declared per-page:
- `/best-iptv-service` → `src/app/best-iptv-service/layout.tsx`
- `/blog` → metadata exported directly from `src/app/blog/page.tsx`
- `/blog/[slug]` → `generateMetadata` in `src/app/blog/[slug]/page.tsx`
- `/subscribe/pro` → `src/app/subscribe/pro/layout.tsx`
- `/login` → `src/app/(auth)/login/layout.tsx` (page is `"use client"`, so layout owns metadata)
- `/privacy` → metadata exported directly from `src/app/privacy/page.tsx`
- `/terms` → metadata exported directly from `src/app/terms/page.tsx`
- `/sms` → metadata exported directly from `src/app/sms/page.tsx`
- `/sms-alerts` → metadata exported directly from `src/app/sms-alerts/page.tsx`

**Rule for new public pages:** add a `metadata` export with `alternates.canonical` pointing at the page's own URL. If the page is a client component (`"use client"`), create a sibling `layout.tsx` to hold metadata.

## Blog System
- **Content lives in** `src/content/blog/*.tsx` — one file per post
- **Each post file exports** `meta: BlogPostMeta` (slug, title, description, publishedAt, readingTime, etc.) and a default React component for the body
- **Registry**: `src/lib/blog.ts` imports each post module and exposes `getAllPosts()`, `getPostBySlug()`, `getAllSlugs()`. To add a new post, create the file then add the import + entry in `src/lib/blog.ts`
- **Routes**: `src/app/blog/page.tsx` (listing) and `src/app/blog/[slug]/page.tsx` (post) — fully server-rendered, statically generated via `generateStaticParams`
- **Typography**: `.blog-content` styles in `globals.css` (cyan link underlines, sized h2/h3, list spacing)
- **Per-post SEO**: `generateMetadata` builds canonical, OpenGraph article tags, and Twitter card. Article JSON-LD injected via `<script type="application/ld+json">`
- **Sitemap**: blog posts auto-added by `src/app/sitemap.ts` via `getAllPosts()`
- **Footer link**: `/blog` is linked from the homepage footer Quick Links so it's crawlable from the index page

## Download Code
- **Current**: `8332050`
- **Android link**: `http://aftv.news/8332050`
- Referenced in: `src/lib/ai.ts`, `src/app/best-iptv-service/page.tsx`, `src/app/(portal)/help/page.tsx`, `src/content/blog/how-to-set-up-iptv-fire-stick.tsx`

## Mobile Performance Notes
- Channel Wall uses `useRef` + `requestAnimationFrame` (no setState in scroll handler)
- ChannelPill uses solid background, no `backdrop-filter` (68 pills would spike GPU memory)
- Hero uses `min-h-dvh` not `min-h-screen` (iOS address bar)
- Scroll-scrubbed video falls back to autoplay loop on touch devices
- SpotlightCard and TV frame 3D tilt are mouse-only (gate via `pointerType`)
- ScrollProgressBar hidden on mobile (`hidden md:block`)
- All `.btn` elements have `min-height: 44px` (Apple HIG)
- `prefers-reduced-motion` kills all animations + fixes opacity flash on stagger reveals

## Auth Flow
1. Customer clicks magic link from email
2. `/verify?token=xxx` validates token
3. JWT session cookie set (7 days)
4. Redirected to `/credentials`

## Database (shared with CRM)
Uses same Supabase instance as CRM:
- customers (with expiry_date, billing fields, custom prices, `sms_consent` boolean + `sms_consent_at` timestamptz for A2P opt-in tracking)
- payments (Stripe payment records)
- magic_links
- support_tickets
- ticket_messages
- service_announcements
- audit_logs
- reviews

## Brand Assets (public/)
- favicon.ico, icon-192.png, icon-512.png
- apple-touch-icon.png
- logo-full-on-dark.png, logo-mark-transparent.png, logo-iptv.png
- og-image.png
- showcase-reel.mp4 (App Showcase scroll-scrub video)

## Email Templates
All emails include logo and use brand gradient (#00d4ff to #7c3aed):
- Magic link login
- Credentials
- Portal access
- Welcome emails (landing-page signups/renewals — `sendWelcomeEmail`, shows "Active Until")
- **Payment receipt** (`sendPaymentReceipt`) — sent on existing-customer renewals via `/billing` (`handleCheckoutCompleted`) AND auto-renew subscription charges (`handleInvoicePaid`). Shows amount paid + updated "Active Until" due date. Added 2026-06-08 because both renewal webhook paths previously updated the CRM expiry but sent NO email, while `/billing/success` told the customer "A receipt has been sent." All paid paths now email a receipt. Sender is `EMAIL_FROM` (now `oouchie@ooustream.com`).

## Deployment
- Vercel
- URL: https://ooustreamportal.vercel.app
- Auto-deploys from `main` branch
- Remote: `github.com/oouchie/ooustream-releases`

## Analytics & Ads (root layout `src/app/layout.tsx`)
- **Meta Pixel** (`438320842295241`) — `next/script` `afterInteractive` + `<noscript>` fallback img in `<head>`.
- **Google AdSense** (publisher `ca-pub-0330206908249817`) — raw `<script async ... crossOrigin="anonymous">` rendered **directly inside `<head>`** (not `next/script`), so the loader appears in server-rendered HTML for AdSense site verification. Loads site-wide on every page. **Auto Ads** are toggled on in the AdSense dashboard (no extra code; the deprecated `enable_page_level_ads` push snippet is intentionally NOT used). Verify live tag via `view-source:https://ooustream.com` → search `ca-pub-0330206908249817`.

## CSS Architecture (`globals.css`)
- CSS variables for all design tokens (colors, fonts, borders)
- Tailwind v4 with `@theme inline` for custom tokens
- Custom keyframes: fadeIn, slideUp, glow, spin, marquee-left, marquee-right
- `.spotlight-card` — pointer-tracked radial gradient via CSS vars `--mx`/`--my`
- `.noise-overlay` — SVG feTurbulence noise at 4% opacity
- `.marquee-track` / `.marquee-mask` — infinite horizontal scroll with edge fade
- `@media (prefers-reduced-motion: reduce)` — kills all animations, forces opacity:1

## AI Support System (`src/lib/ai.ts`)
- Claude API integration for customer support chat
- System prompt loaded with service knowledge, setup guides, troubleshooting
- Pulls customer context from Supabase (account data, credentials, subscription)
- Pre-ticket chatbot on `/support` page
- Auto-reply on ticket creation with personalized troubleshooting
- **Timeout hardening (do not regress)**: the Anthropic client uses `maxRetries: 0` (the `generateAIResponse` loop owns retries) and each `messages.create` call passes a 15s `timeout`. The route `src/app/api/ai/chat/route.ts` exports `maxDuration = 60`. Without these, a 529 overload spike compounded the SDK's default retries (maxRetries 2, 10-min timeout) past the function budget → non-JSON 504 → the chat widget's `catch` showed "AI assistant temporarily unavailable". Worst-case bounded path is ~48s < 60s, so the function always returns JSON.

## SMS / A2P 10DLC
- **Only SMS sent**: the magic-link login text (`sendMagicLinkSMS` in `src/lib/magic-link.ts`). Body leads with brand + `Reply STOP to opt out, HELP for help`. Gated by `SMS_ENABLED` (must be `true`).
- **Campaign APPROVED 2026-06-09; SMS login is LIVE in Production as of 2026-06-10.** Going live required adding FIVE env vars to Vercel Production — the Twilio creds were NEVER on Vercel despite the `.env.local` "same as CRM" comment (verified empty via `vercel env ls production`): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_MESSAGING_SERVICE_SID` (`MGee134cc169169e8ed8e9eb45c3a762ba`), and `SMS_ENABLED=true`. Set Production-only so Preview/Dev deploys never send real texts. Do NOT assume Twilio vars exist on Vercel for any future change — check `vercel env ls production`.
- **Sender routing (A2P compliance)**: `sendMagicLinkSMS` prefers `TWILIO_MESSAGING_SERVICE_SID` (`MGee134cc169169e8ed8e9eb45c3a762ba`) and sends `MessagingServiceSid` — NOT a bare `From`. The approved A2P campaign is attached to the Messaging Service, and `+16786806598` (Phone Number SID `PN6fa4e3b7484c158ab718ffe530596eb7`) lives in that service's sender pool. Sending with a raw `From` bypasses the campaign registration and risks carrier filtering. Falls back to `From: TWILIO_PHONE_NUMBER` only if the service SID is unset.
- **Opt-in (CTA)**: disclosure under the phone field on `/login` (`method === "magic"` tab, the default) + dedicated public `/sms` terms page. Privacy `/privacy` §3 covers SMS. These must stay live — A2P vetting verifies the CTA on the live site.
- **Campaign scope**: transactional one-time login/verification links only. Do NOT register marketing/renewal/credentials-over-SMS use cases (credentials-via-SMS is a rejection trigger and contradicts the credentials-only-on-`/credentials` policy).
- Verify links use `NEXT_PUBLIC_PORTAL_URL` (now `https://ooustream.com`).

### Twilio A2P Campaign Registration (approved copy)
The campaign is registered in the Twilio Console / The Campaign Registry (TCR) — these are **registration fields, not code**. A prior submission was rejected with **error 30886 (invalid campaign description)**: the description was too vague / not aligned with use case + sample. Edit and **resubmit the existing campaign** (don't create a new one). Every claim below is verifiable on the live site (`/login` CTA + `/sms` terms + matching sample), which is what the TCR reviewer checks.
- **Use case**: Account Notification (or 2FA) — NOT Marketing/Mixed (mismatch alone triggers 30886).
- **Privacy Policy URL**: `https://ooustream.com/privacy` (live, has §3 SMS section + "do not sell/rent/share phone number" language).
- **Terms URL**: `https://ooustream.com/terms`.
- **Campaign Description**: "OOUStream is an IPTV streaming subscription service. This campaign sends one-time, customer-initiated account login (verification) links by SMS to existing OOUStream customers who request access to their account portal. When a customer enters their own mobile number on the login page at ooustream.com/login and submits the request, OOUStream sends a single SMS containing a secure, time-limited link used to verify identity and sign in (passwordless authentication). These are strictly transactional account-authentication messages triggered by the customer's own login request. OOUStream does not send marketing, promotional, or recurring messages, and never sends passwords or login credentials by SMS. Customers can reply STOP to opt out and HELP for help at any time."
- **Opt-in / Message Flow (CTA)**: "End users opt in directly on OOUStream's public login page at https://ooustream.com/login. On the 'Email / Phone' tab, the user enters their mobile phone number to request a login link. A consent disclosure is displayed directly beneath the phone input: 'If you enter a phone number, you agree to receive a one-time login text from OOUStream. Msg & data rates may apply. Reply STOP to opt out, HELP for help.' Submitting the number constitutes consent, and consent is not a condition of purchase. Full SMS program terms are published at https://ooustream.com/sms."
- **Sample message**: "OOUStream: your login link (expires in 15 min): https://ooustream.com/verify?token=ab12cd34 Reply STOP to opt out, HELP for help."
- **Brand/entity name** must be the actual registered business (OOUStream / legal entity), used consistently — not an ISV/platform name.

### Second Campaign — Account Notifications (broad transactional: renewal, payment, service, account)
**STATUS (2026-06-11): registration SUBMITTED to TCR by the owner — awaiting vetting/approval. Holding until approved.** All site-side prerequisites are LIVE (consent toggle, `/sms-alerts` terms, broadened consent wording, opt-in confirmation send wired). Nothing more to build until approval.

**To resume once approved:**
1. Capture the 2nd Messaging Service's SID (the new service this campaign is attached to) and set **`TWILIO_BILLING_MESSAGING_SERVICE_SID`** on Vercel **Production** (`vercel env add`). Setting it auto-activates the opt-in confirmation text (no code change — see the confirmation bullet below).
2. Confirm the 2nd dedicated phone number is in that service's sender pool (login number `+16786806598` is bound to campaign 1 — must NOT be reused).
3. Build Phase 3 sending code (see Phase 3 note at the end of this section).
4. Smoke test: log in → dashboard → toggle on → confirm the confirmation text arrives via the new number.

Scoped **deliberately broad** (decided 2026-06-10) so ONE approval covers every transactional/account text we'll ever send — renewal & payment reminders, service notifications, and account updates — instead of going back to TCR per message type. **Marketing/promotional SMS (e.g. the CRM SMS blast, deals, win-back) is NOT covered and CANNOT be folded in** — Account-Notification use case + promo content is an auto-reject (30886) and gets filtered; that needs its own separate Marketing campaign.

These are **out of scope for the approved login campaign** — that campaign's own description states OOUStream "does not send marketing, promotional, or **recurring** messages," and its sample is a login link. There is NO wording that makes a reminder ride the login campaign; doing so risks carrier 30007 filtering AND TCR suspension of the working login texts. So they run as a **separate, second A2P campaign**.

**Twilio topology (hard constraint):** 1 Messaging Service = 1 campaign; 1 phone number = 1 Messaging Service. The second campaign therefore needs its **own Messaging Service + its own dedicated phone number** — it CANNOT reuse `+16786806598` / `MGee134cc169169e8ed8e9eb45c3a762ba` (those are bound to the login campaign). Capture the new service SID into env `TWILIO_BILLING_MESSAGING_SERVICE_SID`.

**Live CTA + terms (already shipped, required for vetting):**
- Opt-in is **self-service in the portal**: `SmsConsentToggle` on `/dashboard` ("Text me account updates") → POSTs `/api/customer/sms-consent` → writes `customers.sms_consent` + `sms_consent_at`. Requires a phone on file.
- **Opt-in confirmation text**: on a true false→true opt-in, the route fires `sendSmsConsentConfirmation` (`src/lib/sms-notifications.ts`). This routes through **`TWILIO_BILLING_MESSAGING_SERVICE_SID`** (campaign 2's service) — it deliberately does **NOT** fall back to the login sender. Until campaign 2 is registered and that env var is set, the send is a **safe no-op** (best-effort; a failure never blocks recording consent). Once the env var is set post-approval, confirmations start sending automatically with no code change. Only fires on the false→true transition (not re-toggles).
- Public program terms: **`/sms-alerts`** (`src/app/sms-alerts/page.tsx`) — separate from `/sms` (login program) for a clean 1:1 TCR mapping. Cross-linked from `/sms`, `/privacy` §3, and the sitemap.
- Reseller consent checkbox label (`reseller/customers/new` + `[id]/edit`) and `/privacy` §3 were corrected to **remove "login credentials via SMS"** (a rejection trigger) and scope to the broad account-notification set below.
- **Consent wording, on-site terms, registered description, and samples must all list the SAME message categories** — carriers/TCR verify the opt-in discloses what you actually send. If you ever add a category, widen all four together (toggle disclosure in `SmsConsentToggle.tsx`, `/sms-alerts`, `/privacy` §3, reseller labels) AND the registered campaign.

**TCR registration copy (campaign 2 — submit these fields):**
- **Use case**: Account Notification — NOT Marketing/Mixed.
- **Privacy Policy URL**: `https://ooustream.com/privacy` · **Terms URL**: `https://ooustream.com/terms`
- **Campaign Description** (REVISED 2026-06-11 after 30886 rejection — tighter, purely transactional, salesy tone removed): "OOUStream (ooustream.com) is an IPTV streaming subscription service. This campaign sends transactional account and service notifications by SMS to existing OOUStream customers who have opted in through their account. Messages are limited to: subscription expiration reminders so a customer knows when their current subscription period is ending; payment notifications such as a failed-payment alert or a receipt confirming a payment the customer made; service status notifications such as outage or scheduled-maintenance alerts; and account notifications such as a change to the customer's account status or an update to a support ticket the customer opened. Every message relates to the recipient's own existing OOUStream account. OOUStream does not send marketing or promotional content under this campaign and never sends passwords or login credentials by SMS. Customers opt in from within their authenticated account dashboard at ooustream.com/dashboard by enabling an SMS notifications setting, and can reply STOP to opt out or HELP for help at any time."
- **Why the first submission failed (30886, field USE_CASE_DESCRIPTION):** verified via Twilio API — brand (`BN3e6be...`) is APPROVED/VERIFIED and campaign 1 passed with the same brand + "IPTV" framing, so neither was the cause. The original campaign-2 description bundled 4 categories and two samples read as purchase-driving ("Renew to avoid interruption", "Update your billing to keep your service active") → reviewer read it as unfocused/promotional. Fix = tighten + neutralize samples (above). Campaign-2 Messaging Service = `MGd8e11ebaa37295b92c34c5c9290ba92a`; Usa2p resource was `QE2c6890da8086d771620e9b13fadeba0b` (FAILED)._
- **Opt-in / Message Flow (CTA)**: "End users opt in from inside their authenticated OOUStream customer portal. After logging in at ooustream.com/login, the customer opens their dashboard (ooustream.com/dashboard) and turns on a 'Text me account updates' toggle. The disclosure next to the toggle reads: 'Get account texts from OOUStream — renewal & payment reminders, service notifications (outages, maintenance), and account updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase.' Enabling the toggle records express consent with a timestamp. Full program terms are published publicly at https://ooustream.com/sms-alerts." (Because the opt-in is behind login, include a screenshot of the dashboard toggle with the submission.)
- **Sample messages** (REVISED 2026-06-11 — neutral/transactional):
  - "OOUStream: your subscription expires on Jun 30. Manage your account: https://ooustream.com/billing Reply STOP to opt out, HELP for help."
  - "OOUStream: we were unable to process your recent payment. View details in your account: https://ooustream.com/billing Reply STOP to opt out, HELP for help."
  - "OOUStream: scheduled maintenance tonight 1-3am ET may briefly affect streaming. Reply STOP to opt out, HELP for help."
  - "OOUStream: your support ticket #1234 has been updated. View it: https://ooustream.com/support Reply STOP to opt out, HELP for help."

**Phase 3 (build AFTER campaign approval — not yet done):** `sendBillingReminderSMS` routed via `TWILIO_BILLING_MESSAGING_SERVICE_SID`; a daily Vercel cron (no `vercel.json` exists yet) that finds `customers` with `expiry_date` in the 7-day and 1-day windows AND `sms_consent = true`, sends once per window (dedupe marker), gated behind `SMS_BILLING_REMINDERS_ENABLED` (default off).
