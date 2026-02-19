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

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        service_type,
        status,
        expiry_date,
        billing_type,
        billing_period,
        plan_type,
        reseller,
        custom_price_monthly,
        custom_price_6month,
        custom_price_yearly,
        auto_renew_enabled
      `)
      .eq('id', session.customerId)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
