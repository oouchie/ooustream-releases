-- Trial Abuse Prevention
-- Run this in the Supabase SQL Editor.
--
-- One row per trial signup ATTEMPT (not just successes), so denied/flagged
-- attempts are themselves searchable signals against future abuse.
-- Every dedup signal is its own indexed column so eligibility checks are fast.

CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Raw contact (what the user typed) + normalized form used for matching
  name             TEXT,
  email            TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  phone            TEXT,
  phone_normalized TEXT,
  device           TEXT,   -- self-reported device (context for the review queue)

  -- Strong signals (Phase 2 populates these)
  card_fingerprint   TEXT,   -- Stripe payment_method.card.fingerprint (stable per card)
  browser_visitor_id TEXT,   -- FingerprintJS visitorId (replaces panel device-ID binding)
  setup_intent_id    TEXT,   -- Stripe SetupIntent that verified the card (single-use, anti-replay)

  -- Network signals
  ip_address TEXT,
  ip_asn     TEXT,
  is_vpn     BOOLEAN DEFAULT false,
  user_agent TEXT,

  -- Decision
  risk_score    INT  NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','denied','review','converted','expired')),
  denial_reason TEXT,
  match_reasons TEXT[],                       -- which signals matched a prior trial
  matched_trial_id UUID REFERENCES trials(id) ON DELETE SET NULL,

  -- Lifecycle
  expires_at   TIMESTAMPTZ NOT NULL,          -- created_at + 24h
  converted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookups for the eligibility check (one index per dedup signal)
CREATE INDEX IF NOT EXISTS idx_trials_email_normalized   ON trials(email_normalized);
CREATE INDEX IF NOT EXISTS idx_trials_phone_normalized   ON trials(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_trials_card_fingerprint   ON trials(card_fingerprint);
CREATE INDEX IF NOT EXISTS idx_trials_browser_visitor_id ON trials(browser_visitor_id);
CREATE INDEX IF NOT EXISTS idx_trials_ip_address         ON trials(ip_address);
CREATE INDEX IF NOT EXISTS idx_trials_status             ON trials(status);
CREATE INDEX IF NOT EXISTS idx_trials_created_at         ON trials(created_at DESC);

-- DB-ENFORCED dedup (race-proof, unlike the app-layer SELECT-then-INSERT check).
-- Partial so that DENIED/EXPIRED attempts can still accumulate as future signals,
-- while a card/email can hold at most ONE live (active/review/converted) trial.
-- createTrial() catches the resulting unique violation (23505) and treats it as a
-- hard deny, so two concurrent requests with the same card/email can't both win.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_trials_card_fp_live
  ON trials(card_fingerprint)
  WHERE card_fingerprint IS NOT NULL AND status IN ('active','review','converted');
CREATE UNIQUE INDEX IF NOT EXISTS uniq_trials_email_live
  ON trials(email_normalized)
  WHERE status IN ('active','review','converted');
-- Each card-verification SetupIntent is single-use (anti-replay), regardless of status.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_trials_setup_intent
  ON trials(setup_intent_id)
  WHERE setup_intent_id IS NOT NULL;
