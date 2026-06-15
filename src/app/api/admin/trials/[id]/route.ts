import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { sendNewCustomerNotification } from '@/lib/email';
import { provisionTrialCustomer } from '@/lib/trial-provision';

// PATCH - Approve ('active') or deny ('denied') a trial from the review queue.
// Approving provisions the 24h customer row (credentials still set manually in
// the CRM, same as every other trial path) and notifies the admin.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();
    if (status !== 'active' && status !== 'denied') {
      return NextResponse.json(
        { error: "status must be 'active' or 'denied'" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { data: trial, error: readErr } = await supabase
      .from('trials')
      .select('id, name, email, phone, device, customer_id, risk_score, status')
      .eq('id', id)
      .single();
    if (readErr || !trial) {
      return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
    }

    if (status === 'denied') {
      const { error } = await supabase
        .from('trials')
        .update({ status: 'denied', denial_reason: 'Denied by admin' })
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('audit_logs').insert({
        action: 'trial_denied',
        table_name: 'trials',
        record_id: id,
        performed_by: 'admin',
        details: { previous_status: trial.status, risk_score: trial.risk_score },
      });
      return NextResponse.json({ success: true });
    }

    // Approve -> provision the trial customer (idempotent), link, notify admin.
    let customerId = trial.customer_id as string | null;
    if (!customerId) {
      const provision = await provisionTrialCustomer(supabase, {
        name: trial.name || 'Trial Customer',
        email: trial.email,
        phone: trial.phone,
        device: trial.device,
        riskScore: trial.risk_score,
        source: 'admin-approved trial review',
      });
      if ('error' in provision) {
        return NextResponse.json({ error: provision.error }, { status: 500 });
      }
      customerId = provision.customerId;
    }

    const { error } = await supabase
      .from('trials')
      .update({ status: 'active', customer_id: customerId })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('audit_logs').insert({
      action: 'trial_approved',
      table_name: 'trials',
      record_id: id,
      performed_by: 'admin',
      details: { previous_status: trial.status, customer_id: customerId },
    });

    try {
      await sendNewCustomerNotification({
        customerEmail: trial.email,
        customerName: trial.name || 'Trial Customer',
        planType: 'standard',
        billingPeriod: '24hr trial',
        amount: 0,
        source: 'admin-approved trial — set up credentials',
      });
    } catch (err) {
      console.error('Trial approval notification failed:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trial update error:', error);
    return NextResponse.json({ error: 'Failed to update trial' }, { status: 500 });
  }
}
