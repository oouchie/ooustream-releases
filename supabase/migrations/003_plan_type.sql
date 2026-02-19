-- Add plan_type to customers (standard = 2 connections, pro = 4 connections/multiview)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'standard'
  CHECK (plan_type IN ('standard', 'pro'));

-- Add plan_type to payments for historical record-keeping
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'standard'
  CHECK (plan_type IN ('standard', 'pro'));
