import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendNewCustomerNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, device, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = createServerClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if customer already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in to the portal.' },
        { status: 409 }
      );
    }

    // Create customer with 24-hour trial expiry
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    const { data: customer, error: insertError } = await supabase
      .from('customers')
      .insert({
        name,
        email: normalizedEmail,
        phone: phone || '',
        service_type: 'Cable',
        status: 'Active',
        plan_type: 'standard',
        billing_type: 'manual',
        billing_period: 'monthly',
        expiry_date: expiryStr,
        reseller: null,
        auto_renew_enabled: false,
        notes: `24hr trial - Device: ${device || 'Not specified'} - Message: ${message}`,
      })
      .select('id')
      .single();

    if (insertError || !customer) {
      console.error('Failed to create trial customer:', insertError);
      return NextResponse.json(
        { error: 'Failed to create trial. Please try again.' },
        { status: 500 }
      );
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'trial_signup',
      table_name: 'customers',
      record_id: customer.id,
      performed_by: 'contact_form',
      details: {
        name,
        email: normalizedEmail,
        phone,
        device,
        message,
        expiry_date: expiryStr,
      },
    });

    // Notify admin at info@ooustick.com
    try {
      await sendNewCustomerNotification({
        customerEmail: normalizedEmail,
        customerName: name,
        planType: 'standard',
        billingPeriod: '24hr trial',
        amount: 0,
        source: `free trial form — Device: ${device || 'Not specified'}`,
      });
    } catch (err) {
      console.error('Failed to send trial notification:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
