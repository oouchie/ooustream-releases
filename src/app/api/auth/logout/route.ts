import { NextResponse } from 'next/server';
import { clearCustomerSession, clearAdminCookie } from '@/lib/auth';

export async function POST() {
  try {
    // Clear both customer and admin sessions
    await clearCustomerSession();
    await clearAdminCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
