import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createMagicLink, sendMagicLinkEmail, sendMagicLinkSMS } from '@/lib/magic-link';

export async function POST(request: NextRequest) {
  try {
    const { identifier, method } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    const searchField = isEmail ? 'email' : 'phone';

    // Clean phone number for search
    let searchValue = identifier;
    if (!isEmail) {
      searchValue = identifier.replace(/\D/g, '');
      // Search with different formats
    }

    // Find customer by email or phone
    let query = supabase
      .from('customers')
      .select('id, name, email, phone');

    if (isEmail) {
      query = query.ilike('email', identifier);
    } else {
      // Search by phone - try to match with or without country code
      query = query.or(`phone.ilike.%${searchValue},phone.ilike.%${searchValue.slice(-10)}`);
    }

    const { data: customer, error } = await query.single();

    if (error || !customer) {
      return NextResponse.json(
        { error: 'No account found with this email or phone number' },
        { status: 404 }
      );
    }

    // Determine delivery method
    const deliveryMethod = method || (isEmail ? 'email' : 'sms');
    const deliveredTo = deliveryMethod === 'email' ? customer.email : customer.phone;

    // Create magic link
    const { token, error: linkError } = await createMagicLink(
      customer.id,
      deliveryMethod,
      deliveredTo
    );

    if (linkError) {
      return NextResponse.json(
        { error: 'Failed to create login link' },
        { status: 500 }
      );
    }

    // Send magic link
    let sendResult;
    if (deliveryMethod === 'email') {
      sendResult = await sendMagicLinkEmail(customer.email, token, customer.name);
    } else {
      sendResult = await sendMagicLinkSMS(customer.phone, token);
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { error: `Failed to send login link: ${sendResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Login link sent to your ${deliveryMethod === 'email' ? 'email' : 'phone'}`,
      deliveryMethod,
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
