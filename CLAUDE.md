# OOUStream Portal

Customer-facing portal and reseller management system.

## Tech Stack
- Next.js 16 (App Router)
- Supabase (shared with CRM)
- SendGrid (email)
- JWT (customer sessions)
- Tailwind CSS

## Design
- **Primary color**: Cyan #00d4ff
- **Secondary color**: Purple #7c3aed
- **Background**: Near-black #0a0a0f
- **Fonts**: Space Grotesk (headings), JetBrains Mono (code)
- Dark theme with glow effects

## Portals

### Customer Portal (/)
- Magic link login (email/SMS)
- Username lookup login
- View subscription status
- View credentials
- **Expiry date with countdown** (days remaining, color-coded warnings)
- Support tickets
- Tutorial videos (YouTube embeds)

### Admin Portal (/admin)
- Password: `ADMIN_PASSWORD` env var
- Manage support tickets
- Create announcements
- View stats
- Link to CRM

### Reseller Portal (/reseller)
- Shun: password `shun2024`
- Prime: password `prime2024`
- Dashboard with their customer stats
- Full customer management (add, edit, view)
- Send credentials and portal access emails
- Only see their own customers

## Environment Variables
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
ADMIN_PASSWORD=oostream2024
SENDGRID_API_KEY=
EMAIL_FROM=Ooustream <oouchie@1865freemoney.com>
NEXT_PUBLIC_PORTAL_URL=https://ooustreamportal.vercel.app
NEXT_PUBLIC_CRM_URL=https://ooustream-crm.vercel.app
RESELLER_SHUN_PASSWORD=shun2024
RESELLER_PRIME_PASSWORD=prime2024
SMS_ENABLED=false
```

## Routes

### Auth
- `/login` - Customer login (magic link or username)
- `/verify` - Magic link verification
- `/admin-login` - Admin password login
- `/reseller-login` - Reseller login (select reseller + password)

### Customer (protected)
- `/` - Dashboard with expiry date, status, quick actions
- `/subscription` - Account status and plan details
- `/credentials` - View login credentials
- `/support` - Ticket list
- `/support/new` - Create ticket
- `/support/[id]` - View ticket
- `/help` - FAQ and guides
- `/tutorials` - Video tutorials (YouTube embeds)
- `/tutorials/[id]` - Individual tutorial

### Admin (protected)
- `/admin` - Dashboard
- `/admin/tickets` - All support tickets
- `/admin/tickets/[id]` - Ticket detail
- `/admin/announcements` - Manage announcements

### Reseller (protected)
- `/reseller` - Dashboard with stats
- `/reseller/customers` - Customer list (filtered to their reseller)
- `/reseller/customers/new` - Add customer (auto-tagged with reseller)
- `/reseller/customers/[id]` - View customer + send buttons
- `/reseller/customers/[id]/edit` - Edit customer

## Tutorial Videos
- Ooustream Setup Tutorial - Part 1 (YouTube)
- Ooustream Setup Tutorial - Part 2 (YouTube)
- Downloading Aurora (YouTube)
- Plus placeholder guides for setup, apps, troubleshooting

## Auth Flow
1. Customer clicks magic link from email
2. `/verify?token=xxx` validates token
3. JWT session cookie set (7 days)
4. Redirected to dashboard

## Database (shared with CRM)
Uses same Supabase instance as CRM:
- customers (with expiry_date)
- magic_links
- support_tickets
- ticket_messages
- service_announcements
- audit_logs

## Brand Assets (public/)
- favicon.ico, icon-192.png, icon-512.png
- apple-touch-icon.png
- logo-full-on-dark.png, logo-mark-transparent.png
- og-image.png

## Email Templates
All emails include logo and use brand gradient (#00d4ff to #7c3aed):
- Magic link login
- Credentials
- Portal access
- Welcome emails

## Deployment
- Vercel
- URL: https://ooustreamportal.vercel.app
