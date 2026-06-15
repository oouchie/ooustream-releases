/**
 * Provision a 24-hour trial customer row.
 *
 * IMPORTANT: this codebase has NO IPTV-panel integration — real streaming
 * credentials are created by a human on the panel and typed into the CRM.
 * So this mirrors the existing trial path (src/app/api/contact/route.ts): it
 * creates the `customers` row with empty credentials + a 24h expiry, and the
 * caller notifies the admin to provision + send credentials. It does NOT, and
 * cannot, mint working credentials on its own.
 *
 * Shared by the public trial route (decision = 'active') and the admin
 * approve action (review -> active) so the customer-insert shape lives in one
 * place. Idempotent on email: if a customer already exists it returns that id
 * rather than creating a duplicate.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ProvisionTrialInput {
  name: string;
  email: string;
  phone?: string | null;
  device?: string | null;
  riskScore?: number;
  source: string;
}

export interface ProvisionTrialResult {
  customerId: string;
  created: boolean;
  error?: string;
}

/** Trial expiry as a YYYY-MM-DD date string, matching the existing contact route. */
export function trialExpiryDateString(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry.toISOString().split('T')[0];
}

export async function provisionTrialCustomer(
  supabase: SupabaseClient,
  input: ProvisionTrialInput,
): Promise<ProvisionTrialResult | { error: string }> {
  const email = input.email.toLowerCase().trim();

  // Idempotent: reuse an existing customer rather than duplicating.
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return { customerId: existing.id, created: false };
  }

  const notes = `24hr trial${
    input.riskScore != null ? ` (risk ${input.riskScore})` : ''
  } - Device: ${input.device || 'Not specified'} - Source: ${input.source}`;

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: input.name,
      email,
      phone: input.phone || '',
      service_type: 'Cable',
      status: 'Active',
      plan_type: 'standard',
      billing_type: 'manual',
      billing_period: 'monthly',
      expiry_date: trialExpiryDateString(),
      reseller: null,
      auto_renew_enabled: false,
      username_1: '',
      password_1: '',
      notes,
    })
    .select('id')
    .single();

  if (error || !customer) {
    return { error: error?.message || 'Failed to create trial customer' };
  }
  return { customerId: customer.id, created: true };
}
