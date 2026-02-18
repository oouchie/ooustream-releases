import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getResellerSession } from '@/lib/auth';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
let _sgInitialized = false;
const initSendGrid = () => {
  if (!_sgInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    _sgInitialized = true;
  }
};

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://ooustick.com';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

  // Generate magic link token
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store magic link
  const { error: linkError } = await supabase.from('magic_links').insert({
    customer_id: customer.id,
    token_hash: tokenHash,
    delivery_method: 'email',
    delivered_to: customer.email,
    expires_at: expiresAt.toISOString(),
  });

  if (linkError) {
    console.error('Failed to create magic link:', linkError);
    return NextResponse.json({ error: 'Failed to create portal link' }, { status: 500 });
  }

  const magicLinkUrl = `${PORTAL_URL}/verify?token=${token}`;

  // Build credentials for email
  const credentials = [
    { username: customer.username_1, password: customer.password_1 },
    { username: customer.username_2, password: customer.password_2 },
    { username: customer.username_3, password: customer.password_3 },
    { username: customer.username_4, password: customer.password_4 },
  ].filter((c) => c.username && c.password);

  const credentialsHtml = credentials.length > 0
    ? `
      <h3 style="color: #111827; margin-top: 24px;">Your Login Credentials</h3>
      ${credentials
        .map(
          (cred, i) => `
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Account ${i + 1}</p>
            <p style="margin: 0 0 4px 0; color: #4b5563;">Username: <strong style="color: #111827;">${cred.username}</strong></p>
            <p style="margin: 0; color: #4b5563;">Password: <strong style="color: #111827;">${cred.password}</strong></p>
          </div>
        `
        )
        .join('')}
    `
    : '';

  try {
    initSendGrid();

    await sgMail.send({
      from: process.env.EMAIL_FROM || 'Ooustream <oouchie@1865freemoney.com>',
      to: customer.email,
      subject: 'Access Your Ooustream Customer Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <img src="https://ooustick.com/logo-iptv.png" alt="Ooustick" style="height: 120px; width: auto;" />
            </div>

            <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #111827; margin-top: 0;">Hi ${customer.name}!</h2>
              <p style="color: #4b5563;">Click the button below to access your customer portal:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLinkUrl}" style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Access Portal
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                Or copy this link: <a href="${magicLinkUrl}" style="color: #00d4ff;">${magicLinkUrl}</a>
              </p>

              ${credentialsHtml}

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <p style="color: #4b5563; margin-bottom: 0;">
                <strong>What you can do in the portal:</strong>
              </p>
              <ul style="color: #4b5563; margin-top: 8px;">
                <li>View your subscription status</li>
                <li>Access your login credentials anytime</li>
                <li>Submit and track support tickets</li>
                <li>Get device setup guides</li>
              </ul>

              <p style="color: #9ca3af; font-size: 14px; margin-top: 24px; margin-bottom: 0;">
                This link expires in 7 days. If you didn't request this, please ignore this email.
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
      action: 'RESELLER_SEND_PORTAL_ACCESS',
      customer_id: customer.id,
      customer_name: customer.name,
      details: `Reseller ${session.reseller} sent portal access to ${customer.email}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
