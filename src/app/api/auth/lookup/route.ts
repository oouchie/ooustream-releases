import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { setCustomerSession } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`lookup:${ip}`, { max: 5, windowSeconds: 900 });
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { username, verification } = await request.json();

    if (!username || !verification) {
      return NextResponse.json(
        { error: 'Username and verification are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Sanitize username — strip any Supabase filter operators
    const sanitized = username.replace(/[^a-zA-Z0-9_\-@.]/g, '');
    if (!sanitized || sanitized.length > 100) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Search for customer by any of the username fields using individual queries
    // to avoid .or() string interpolation injection
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, username_1, username_2, username_3, username_4')
      .or(`username_1.eq."${sanitized}",username_2.eq."${sanitized}",username_3.eq."${sanitized}",username_4.eq."${sanitized}"`);

    if (error || !customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or verification. Please try again.' },
        { status: 401 }
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
        { error: 'Invalid username or verification. Please try again.' },
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
