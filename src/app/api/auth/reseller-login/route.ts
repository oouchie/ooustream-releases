import { NextRequest, NextResponse } from 'next/server';
import { setResellerCookie, getAvailableResellers } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`reseller-login:${ip}`, { max: 5, windowSeconds: 900 });
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

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
