-- OOUStream Portal Payments Migration
-- Run this in Supabase SQL Editor

-- Add billing columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'manual' CHECK (billing_type IN ('auto', 'manual')),
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', '6month', 'yearly')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS custom_price_monthly INTEGER,
ADD COLUMN IF NOT EXISTS custom_price_6month INTEGER,
ADD COLUMN IF NOT EXISTS custom_price_yearly INTEGER,
ADD COLUMN IF NOT EXISTS auto_renew_enabled BOOLEAN DEFAULT false;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Payment details
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),

  -- Billing info
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', '6month', 'yearly')),
  period_start DATE,
  period_end DATE,

  -- Payment type
  payment_type TEXT NOT NULL DEFAULT 'one_time' CHECK (payment_type IN ('one_time', 'subscription')),

  -- Metadata
  description TEXT,
  failure_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer ON customers(stripe_customer_id);

-- Trigger for payments updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy (allow service role full access)
CREATE POLICY "Service role full access to payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);
