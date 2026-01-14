import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyMagicLink } from '@/lib/magic-link';
import { setCustomerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the magic link
    const { customerId, error } = await verifyMagicLink(token);

    if (error || !customerId) {
      return NextResponse.json(
        { error: error || 'Invalid or expired link' },
        { status: 401 }
      );
    }

    // Get customer details
    const supabase = createServerClient();
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Set customer session
    await setCustomerSession({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      type: 'customer',
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
