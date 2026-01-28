import { NextResponse } from 'next/server';
import { clearResellerCookie } from '@/lib/auth';

export async function POST() {
  await clearResellerCookie();
  return NextResponse.json({ success: true });
}
