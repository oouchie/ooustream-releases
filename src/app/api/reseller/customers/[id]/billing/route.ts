import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getResellerSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();

  // Get customer billing info
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      billing_type,
      billing_period,
      plan_type,
      stripe_customer_id,
      custom_price_monthly,
      custom_price_6month,
      custom_price_yearly,
      auto_renew_enabled,
      expiry_date,
      status
    `)
    .eq('id', id)
    .eq('reseller', session.reseller)
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Get recent payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    billing: customer,
    payments: payments || [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Verify customer belongs to this reseller
    const { data: existing } = await supabase
      .from('customers')
      .select('id, reseller, name')
      .eq('id', id)
      .eq('reseller', session.reseller)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Only allow updating billing-related fields
    const allowedFields = [
      'billing_type',
      'billing_period',
      'plan_type',
      'custom_price_monthly',
      'custom_price_6month',
      'custom_price_yearly',
      'auto_renew_enabled',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action: 'RESELLER_UPDATE_BILLING',
      customer_id: data.id,
      customer_name: data.name,
      details: `Reseller ${session.reseller} updated billing for: ${data.name}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update billing error:', error);
    return NextResponse.json(
      { error: 'Failed to update billing settings' },
      { status: 500 }
    );
  }
}
