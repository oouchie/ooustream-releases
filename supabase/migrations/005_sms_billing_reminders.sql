-- Phase 3 — SMS billing/renewal reminders (A2P campaign 2).
-- Idempotency log so the daily cron sends each window once per billing cycle.
-- A "cycle" is keyed by the customer's current expiry_date; when they renew,
-- expiry_date changes -> a fresh (customer_id, expiry_date, window) key -> new reminders.

create table if not exists public.sms_reminder_log (
  id           uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers(id) on delete cascade,
  expiry_date      date not null,
  reminder_window  text not null check (reminder_window in ('7day', '1day')),
  sent_at          timestamptz not null default now()
);

-- One reminder per (customer, billing cycle, window). The cron claims a row via
-- INSERT ... ON CONFLICT DO NOTHING before sending, so concurrent/duplicate runs
-- can never double-text.
create unique index if not exists sms_reminder_log_unique
  on public.sms_reminder_log (customer_id, expiry_date, reminder_window);

-- Lookup for the cron's per-run filtering.
create index if not exists sms_reminder_log_customer_idx
  on public.sms_reminder_log (customer_id);
