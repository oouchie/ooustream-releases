import { NextRequest, NextResponse } from 'next/server';
import { setResellerCookie, getAvailableResellers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { reseller, password } = await request.json();

    if (!reseller || !password) {
      return NextResponse.json(
        { error: 'Reseller and password are required' },
        { status: 400 }
      );
    }

    // Validate reseller name
    const availableResellers = getAvailableResellers();
    if (!availableResellers.includes(reseller)) {
      return NextResponse.json(
        { error: 'Invalid reseller' },
        { status: 400 }
      );
    }

    const success = await setResellerCookie(reseller, password);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, reseller });
  } catch (error) {
    console.error('Reseller login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
