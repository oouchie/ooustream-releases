import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getResellerSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = createServerClient();

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('reseller', session.reseller);

  // Search filter
  if (search) {
    const safeSearch = search.replace(/[%_]/g, '\\$&');
    query = query.or(
      `name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,username_1.ilike.%${safeSearch}%`
    );
  }

  // Status filter
  if (status) {
    query = query.eq('status', status);
  }

  // Sorting and pagination
  query = query.order('created_at', { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    customers: data,
    total: count,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Auto-set the reseller field
    const customerData = {
      ...body,
      reseller: session.reseller,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action: 'RESELLER_CREATE_CUSTOMER',
      customer_id: data.id,
      customer_name: data.name,
      details: `Reseller ${session.reseller} created customer: ${data.name}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
