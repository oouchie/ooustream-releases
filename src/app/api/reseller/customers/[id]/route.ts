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

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('reseller', session.reseller)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json(data);
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

    // First verify this customer belongs to this reseller
    const { data: existing } = await supabase
      .from('customers')
      .select('id, reseller')
      .eq('id', id)
      .eq('reseller', session.reseller)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Don't allow changing the reseller
    delete body.reseller;

    const { data, error } = await supabase
      .from('customers')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action: 'RESELLER_UPDATE_CUSTOMER',
      customer_id: data.id,
      customer_name: data.name,
      details: `Reseller ${session.reseller} updated customer: ${data.name}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();

  // First verify this customer belongs to this reseller
  const { data: existing } = await supabase
    .from('customers')
    .select('id, name, reseller')
    .eq('id', id)
    .eq('reseller', session.reseller)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from('audit_logs').insert({
    action: 'RESELLER_DELETE_CUSTOMER',
    customer_id: id,
    customer_name: existing.name,
    details: `Reseller ${session.reseller} deleted customer: ${existing.name}`,
    ip_address: request.headers.get('x-forwarded-for') || 'unknown',
  });

  return NextResponse.json({ success: true });
}
