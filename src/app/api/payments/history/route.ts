import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get payment history
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Payment history error:', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
