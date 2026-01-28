import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getResellerSession } from '@/lib/auth';

export async function GET() {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  // Get all customers for this reseller
  const { data: customers, error } = await supabase
    .from('customers')
    .select('status, service_type')
    .eq('reseller', session.reseller);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'Active').length,
    inactive: customers.filter((c) => c.status === 'Inactive').length,
    expired: customers.filter((c) => c.status === 'Expired').length,
    cable: customers.filter((c) => c.service_type === 'Cable').length,
    plex: customers.filter((c) => c.service_type === 'Plex').length,
    both: customers.filter((c) => c.service_type === 'Cable/Plex').length,
  };

  return NextResponse.json(stats);
}
