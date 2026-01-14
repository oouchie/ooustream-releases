import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { setCustomerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, verification } = await request.json();

    if (!username || !verification) {
      return NextResponse.json(
        { error: 'Username and verification are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Search for customer by any of the username fields
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, username_1, username_2, username_3, username_4')
      .or(`username_1.eq.${username},username_2.eq.${username},username_3.eq.${username},username_4.eq.${username}`);

    if (error || !customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this username' },
        { status: 404 }
      );
    }

    // Get the first matching customer
    const customer = customers[0];

    // Verify with either last 4 of phone or email domain
    const cleanVerification = verification.toLowerCase().trim();
    const phoneLast4 = customer.phone?.replace(/\D/g, '').slice(-4);
    const emailDomain = customer.email?.split('@')[1]?.toLowerCase();

    const isVerified =
      cleanVerification === phoneLast4 ||
      cleanVerification === emailDomain ||
      customer.email?.toLowerCase().includes(cleanVerification);

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Verification failed. Please check your phone number or email.' },
        { status: 401 }
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
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
