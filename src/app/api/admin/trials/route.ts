import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

// GET - List trials for the admin review queue (most recent first).
export async function GET() {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: trials, error } = await supabase
      .from('trials')
      .select('*, customer:customers(id, name, email, status)')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trials: trials || [] });
  } catch (error) {
    console.error('Admin trials fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch trials' }, { status: 500 });
  }
}
