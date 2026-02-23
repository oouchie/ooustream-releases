import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Get total customers count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get active customers count
    const { count: activeCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    // Get open tickets count
    const { count: openTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']);

    // Get pending tickets (waiting for admin response)
    const { count: pendingTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Get active announcements count
    const { count: activeAnnouncements } = await supabase
      .from('service_announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get pending reviews count
    const { count: pendingReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    return NextResponse.json({
      stats: {
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        openTickets: openTickets || 0,
        pendingTickets: pendingTickets || 0,
        activeAnnouncements: activeAnnouncements || 0,
        pendingReviews: pendingReviews || 0,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
