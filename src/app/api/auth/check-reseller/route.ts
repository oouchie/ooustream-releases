import { NextResponse } from 'next/server';
import { getResellerSession } from '@/lib/auth';

export async function GET() {
  const session = await getResellerSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ reseller: session.reseller });
}
