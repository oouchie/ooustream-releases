import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getResellerSession } from '@/lib/auth';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
let _sgInitialized = false;
const initSendGrid = () => {
  if (!_sgInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    _sgInitialized = true;
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getResellerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();

  // Get customer (verify it belongs to this reseller)
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('reseller', session.reseller)
    .single();

  if (fetchError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  if (!customer.email) {
    return NextResponse.json({ error: 'Customer has no email' }, { status: 400 });
  }

  // Build credentials list
  const credentials = [
    { username: customer.username_1, password: customer.password_1 },
    { username: customer.username_2, password: customer.password_2 },
    { username: customer.username_3, password: customer.password_3 },
    { username: customer.username_4, password: customer.password_4 },
  ].filter((c) => c.username && c.password);

  if (credentials.length === 0) {
    return NextResponse.json({ error: 'No credentials found' }, { status: 400 });
  }

  const credentialsHtml = credentials
    .map(
      (cred, i) => `
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Account ${i + 1}</p>
        <p style="margin: 0 0 4px 0; color: #4b5563;">Username: <strong style="color: #111827;">${cred.username}</strong></p>
        <p style="margin: 0; color: #4b5563;">Password: <strong style="color: #111827;">${cred.password}</strong></p>
      </div>
    `
    )
    .join('');

  try {
    initSendGrid();

    await sgMail.send({
      from: process.env.EMAIL_FROM || 'Ooustream <oouchie@1865freemoney.com>',
      to: customer.email,
      subject: 'Your Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <img src="https://portal.ooustick.com/logo-full-on-dark.png" alt="Ooustream" style="height: 40px; width: auto;" />
            </div>

            <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #111827; margin-top: 0;">Hi ${customer.name}!</h2>

              <p style="color: #4b5563;">Here are your login credentials as requested:</p>

              ${credentialsHtml}

              <p style="color: #4b5563; margin-top: 20px;">
                <strong>Important:</strong> Please keep these credentials safe and do not share them with anyone.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
                If you didn't request this email, please contact us immediately.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Ooustream &copy; ${new Date().getFullYear()}</p>
            </div>
          </body>
        </html>
      `,
    });

    // Log the action
    await supabase.from('audit_logs').insert({
      action: 'RESELLER_SEND_CREDENTIALS',
      customer_id: customer.id,
      customer_name: customer.name,
      details: `Reseller ${session.reseller} sent credentials to ${customer.email}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
