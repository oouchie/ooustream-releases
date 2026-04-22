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

## Stripe Account / Key Rotation
If you ever rotate Stripe accounts (new `sk_live_...`, `pk_live_...`, `whsec_...`):
1. Update the three env vars on Vercel (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) in Production + Development. Preview requires a specific git branch.
2. Register the webhook endpoint in the new Stripe account at `https://ooustreamportal.vercel.app/api/webhooks/stripe` with events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`. Copy the new `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET`.
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
EMAIL_FROM=Ooustream <oouchie@1865freemoney.com>
NEXT_PUBLIC_PORTAL_URL=https://ooustreamportal.vercel.app
NEXT_PUBLIC_CRM_URL=https://ooustream-crm.vercel.app
ANTHROPIC_API_KEY=
RESELLER_SHUN_PASSWORD=shun2024
RESELLER_PRIME_PASSWORD=prime2024
RESELLER_JK_PASSWORD=jk2024
RESELLER_EVAN_PASSWORD=evan2024
SMS_ENABLED=false

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Routes

### Public
- `/` — Landing page (marketing)
- `/best-iptv-service` — SEO landing page
- `/subscribe/pro` — Direct Pro plan checkout (for in-app links)
- `/privacy` — Privacy policy
- `/terms` — Terms of service

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
- Sitemap at `/sitemap.xml` (homepage, best-iptv-service, subscribe/pro, login, privacy, terms)
- Robots at `/robots.txt` (disallows /api/, /admin/, /reseller/)
- Metadata with canonical URLs on all public pages
- OpenGraph + Twitter cards
- JSON-LD: Organization + WebSite schema
- `application-name` meta tag for Google site name

## Download Code
- **Current**: `7309199`
- **Android link**: `http://aftv.news/7309199`
- Referenced in: `src/lib/ai.ts`, `src/app/best-iptv-service/page.tsx`, `src/app/(portal)/help/page.tsx`

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
- customers (with expiry_date, billing fields, custom prices)
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
- Welcome emails

## Deployment
- Vercel
- URL: https://ooustreamportal.vercel.app
- Auto-deploys from `main` branch
- Remote: `github.com/oouchie/ooustream-releases`

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
