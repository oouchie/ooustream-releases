/**
 * Trial abuse prevention.
 *
 * People WILL try to farm multiple 24-hour free trials. No single signal
 * stops them (they change email, use VPNs, etc.), so we layer signals and
 * make a risk-scored decision:
 *
 *   - A reused CARD FINGERPRINT or normalized EMAIL is a hard deny (same person).
 *   - Weaker signals (phone, browser fingerprint, IP, disposable email, VPN)
 *     accumulate a risk score; over a threshold we deny or flag for review.
 *
 * This module is pure + dependency-free except for the Supabase client passed
 * in. Stripe card fingerprint, FingerprintJS visitorId, Twilio VOIP detection,
 * and IP reputation are layered on top in the API route (Phase 2) — this just
 * needs the signal VALUES, wherever they came from.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/** Trial lifetime. */
export const TRIAL_DURATION_HOURS = 24;

/**
 * Disposable / temp-mail domains. Not exhaustive — the laziest abusers use
 * these, so even a short list catches a lot. Extend freely.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
  'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmailo.com', 'tmpmail.org',
  '10minutemail.com', '10minutemail.net', 'throwawaymail.com', 'getnada.com',
  'trashmail.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'yopmail.com',
  'mohmal.com', 'mintemail.com', 'emailondeck.com', 'spam4.me', 'mailnesia.com',
  'inboxkitten.com', 'tempr.email', 'discard.email', 'mailcatch.com', 'moakt.com',
  'burnermail.io', 'temp-mail.io', 'luxusmail.org', 'cs.email', 'dropmail.me',
]);

/** Domains that ignore dots and treat everything after `+` as the same inbox. */
const PLUS_AND_DOT_ALIASING_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/** All signal values for one trial attempt. Any may be undefined. */
export interface TrialSignals {
  email: string;
  phone?: string;
  cardFingerprint?: string;
  browserVisitorId?: string;
  ipAddress?: string;
  ipAsn?: string;
  isVpn?: boolean;
  userAgent?: string;
}

/** A normalized email — and whether its domain is disposable. */
export interface NormalizedEmail {
  normalized: string;
  disposable: boolean;
}

export type TrialDecision = 'active' | 'review' | 'denied';

export interface TrialEvaluation {
  decision: TrialDecision;
  riskScore: number;
  /** Human-readable reasons (for the denial message / admin queue). */
  reasons: string[];
  /** Machine tags of which signals matched a prior trial. */
  matchedSignals: string[];
  /** The first prior trial we matched, for linkage. */
  matchedTrialId: string | null;
}

/* ------------------------------------------------------------------ *
 * Scoring weights / thresholds
 * ------------------------------------------------------------------ */

/** Weight added to the risk score per weak-signal match / property. */
const WEIGHTS = {
  phoneReused: 50,
  browserReused: 40,
  ipReused: 15,
  disposableEmail: 30,
  voipOrVpn: 25,
} as const;

/** At/above this score we hold the trial for manual review. */
export const REVIEW_THRESHOLD = 45;
/** At/above this score we deny outright. */
export const DENY_THRESHOLD = 70;

/* ------------------------------------------------------------------ *
 * Normalization
 * ------------------------------------------------------------------ */

/**
 * Canonicalize an email so aliases collapse to one identity:
 *   - lowercase + trim
 *   - Gmail/Googlemail: drop dots in the local part, drop `+tag`
 *   - other providers: drop `+tag` only (dots are significant elsewhere)
 *
 * `john.doe+trial@gmail.com` and `johndoe@googlemail.com` → `johndoe@gmail.com`.
 */
export function normalizeEmail(email: string): NormalizedEmail {
  const cleaned = email.trim().toLowerCase();
  const at = cleaned.lastIndexOf('@');
  if (at === -1) {
    // Not a valid-looking email; return as-is so the caller can still reject it.
    return { normalized: cleaned, disposable: false };
  }

  let local = cleaned.slice(0, at);
  let domain = cleaned.slice(at + 1);

  // googlemail.com is an alias of gmail.com
  if (domain === 'googlemail.com') domain = 'gmail.com';

  // Strip +tag everywhere
  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  // Strip dots for providers that ignore them
  if (PLUS_AND_DOT_ALIASING_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
  }

  return {
    normalized: `${local}@${domain}`,
    disposable: DISPOSABLE_EMAIL_DOMAINS.has(domain),
  };
}

/** True if the email's domain is a known disposable/temp-mail provider. */
export function isDisposableEmail(email: string): boolean {
  return normalizeEmail(email).disposable;
}

/**
 * Normalize a phone number to E.164 (US/NANP default).
 * Lightweight (no libphonenumber): strips to digits and applies NANP rules.
 * Returns null if it can't produce something plausible.
 *
 * Production upgrade: Twilio Lookup gives authoritative E.164 + line-type
 * (catches VOIP) — wire that in Phase 2 and pass the result here.
 */
export function normalizePhone(
  phone: string | undefined | null,
  defaultCountry: 'US' = 'US',
): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  // Drop a leading international-dial 011 prefix
  if (digits.startsWith('011')) digits = digits.slice(3);

  if (defaultCountry === 'US') {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  }
  // Already includes a country code (7–15 digits per E.164)
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

/**
 * Turn a set of matched signals + current-attempt properties into a decision.
 * Pure function — easy to unit-test and reason about.
 */
export function scoreTrialRisk(input: {
  /** Signal tags that matched a PRIOR trial. */
  matchedSignals: string[];
  disposableEmail?: boolean;
  voipOrVpn?: boolean;
}): { decision: TrialDecision; riskScore: number; reasons: string[] } {
  const matched = new Set(input.matchedSignals);
  const reasons: string[] = [];

  // Hard denies — a reused strong identity signal IS the same person.
  if (matched.has('card_fingerprint')) {
    return {
      decision: 'denied',
      riskScore: 100,
      reasons: ['This payment card has already been used for a free trial.'],
    };
  }
  if (matched.has('email_normalized')) {
    return {
      decision: 'denied',
      riskScore: 100,
      reasons: ['This email (or an alias of it) has already used a free trial.'],
    };
  }

  // Weak signals accumulate.
  let score = 0;
  if (matched.has('phone_normalized')) {
    score += WEIGHTS.phoneReused;
    reasons.push('Phone number already used for a trial.');
  }
  if (matched.has('browser_visitor_id')) {
    score += WEIGHTS.browserReused;
    reasons.push('Same browser/device already used for a trial.');
  }
  if (matched.has('ip_address')) {
    score += WEIGHTS.ipReused;
    reasons.push('Same network/IP already used for a trial.');
  }
  if (input.disposableEmail) {
    score += WEIGHTS.disposableEmail;
    reasons.push('Disposable/temporary email address.');
  }
  if (input.voipOrVpn) {
    score += WEIGHTS.voipOrVpn;
    reasons.push('VOIP number or VPN/proxy connection.');
  }

  let decision: TrialDecision = 'active';
  if (score >= DENY_THRESHOLD) decision = 'denied';
  else if (score >= REVIEW_THRESHOLD) decision = 'review';

  return { decision, riskScore: score, reasons };
}

/* ------------------------------------------------------------------ *
 * Eligibility (DB-backed)
 * ------------------------------------------------------------------ */

/**
 * Look up whether any prior trial matches the given signals, then score it.
 * Does NOT write anything — call `createTrial` to persist the outcome.
 *
 * One query per present signal keeps it injection-safe and simple; trial
 * signups are low-volume so the extra round-trips don't matter.
 */
export async function checkTrialEligibility(
  supabase: SupabaseClient,
  signals: TrialSignals,
): Promise<TrialEvaluation & { emailNormalized: string; phoneNormalized: string | null }> {
  const email = normalizeEmail(signals.email);
  const phoneNormalized = normalizePhone(signals.phone);

  // Map of signal-tag -> value to match against prior trials.
  const lookups: Array<[string, string, string]> = [
    ['card_fingerprint', 'card_fingerprint', signals.cardFingerprint || ''],
    ['email_normalized', 'email_normalized', email.normalized],
    ['phone_normalized', 'phone_normalized', phoneNormalized || ''],
    ['browser_visitor_id', 'browser_visitor_id', signals.browserVisitorId || ''],
    ['ip_address', 'ip_address', signals.ipAddress || ''],
  ];

  const matchedSignals: string[] = [];
  let matchedTrialId: string | null = null;

  for (const [tag, column, value] of lookups) {
    if (!value) continue;
    const { data, error } = await supabase
      .from('trials')
      .select('id')
      .eq(column, value)
      .limit(1);
    if (error) {
      // Fail SAFE: if we can't verify, flag for review rather than auto-allow.
      return {
        decision: 'review',
        riskScore: REVIEW_THRESHOLD,
        reasons: [`Could not verify trial eligibility (${error.message}).`],
        matchedSignals: [],
        matchedTrialId: null,
        emailNormalized: email.normalized,
        phoneNormalized,
      };
    }
    if (data && data.length > 0) {
      matchedSignals.push(tag);
      if (!matchedTrialId) matchedTrialId = data[0].id;
    }
  }

  const scored = scoreTrialRisk({
    matchedSignals,
    disposableEmail: email.disposable,
    voipOrVpn: signals.isVpn,
  });

  return {
    ...scored,
    matchedSignals,
    matchedTrialId,
    emailNormalized: email.normalized,
    phoneNormalized,
  };
}

/** Non-scoring metadata stored alongside the trial for the admin review queue. */
export interface TrialMeta {
  name?: string;
  device?: string;
  /** Stripe SetupIntent that verified the card — stored single-use (anti-replay). */
  setupIntentId?: string;
}

/**
 * Outcome of persisting a trial attempt.
 *  - ok:true            → row written.
 *  - ok:false,conflict  → a DB unique index rejected it (a live trial already
 *    exists for this card/email, or this SetupIntent was already used). The
 *    caller MUST treat this as a hard deny — it's the race-proof backstop for
 *    the app-layer SELECT check.
 *  - ok:false,conflict:false → some other insert error (e.g. table missing).
 */
export type CreateTrialResult =
  | { ok: true; id: string; status: TrialDecision }
  | { ok: false; conflict: boolean };

/**
 * Persist a trial attempt with its decision. Always records the row (even for
 * denials) so the attempt itself becomes a signal against future abuse.
 */
export async function createTrial(
  supabase: SupabaseClient,
  signals: TrialSignals,
  evaluation: TrialEvaluation & { emailNormalized: string; phoneNormalized: string | null },
  customerId?: string | null,
  meta?: TrialMeta,
): Promise<CreateTrialResult> {
  const expiresAt = new Date(Date.now() + TRIAL_DURATION_HOURS * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('trials')
    .insert({
      customer_id: customerId ?? null,
      name: meta?.name ?? null,
      device: meta?.device ?? null,
      email: signals.email.trim(),
      email_normalized: evaluation.emailNormalized,
      phone: signals.phone ?? null,
      phone_normalized: evaluation.phoneNormalized,
      card_fingerprint: signals.cardFingerprint ?? null,
      browser_visitor_id: signals.browserVisitorId ?? null,
      setup_intent_id: meta?.setupIntentId ?? null,
      ip_address: signals.ipAddress ?? null,
      ip_asn: signals.ipAsn ?? null,
      is_vpn: signals.isVpn ?? false,
      user_agent: signals.userAgent ?? null,
      risk_score: evaluation.riskScore,
      status: evaluation.decision,
      denial_reason: evaluation.decision === 'denied' ? evaluation.reasons.join(' ') : null,
      match_reasons: evaluation.reasons.length ? evaluation.reasons : null,
      matched_trial_id: evaluation.matchedTrialId,
      expires_at: expiresAt.toISOString(),
    })
    .select('id, status')
    .single();

  if (error || !data) {
    // 23505 = unique_violation (one of the partial unique indexes fired).
    const conflict = (error as { code?: string } | null)?.code === '23505';
    if (!conflict && error) console.error('createTrial insert failed:', error);
    return { ok: false, conflict };
  }
  return { ok: true, id: data.id, status: data.status as TrialDecision };
}
