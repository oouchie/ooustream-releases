# OOUStream Portal

Customer-facing portal and reseller management system.

## Tech Stack
- Next.js 16 (App Router)
- Supabase (shared with CRM)
- SendGrid (email)
- JWT (customer sessions)

## Portals

### Customer Portal (/)
- Magic link login (email/SMS)
- Username lookup login
- View subscription status
- View credentials
- Support tickets
- Tutorial videos

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
- `/` - Redirects to /subscription if logged in
- `/subscription` - Account status
- `/credentials` - View login credentials
- `/support` - Ticket list
- `/support/new` - Create ticket
- `/support/[id]` - View ticket
- `/help` - FAQ and guides
- `/tutorials` - Video tutorials

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

## Auth Flow
1. Customer clicks magic link from email
2. `/verify?token=xxx` validates token
3. JWT session cookie set (7 days)
4. Redirected to `/subscription`

## Database (shared with CRM)
Uses same Supabase instance as CRM:
- customers
- magic_links
- support_tickets
- ticket_messages
- service_announcements
- audit_logs

## Deployment
- Vercel
- URL: https://ooustreamportal.vercel.app
