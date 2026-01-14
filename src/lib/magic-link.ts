import { createServerClient } from './supabase';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash token for storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Create magic link and store in database
export async function createMagicLink(
  customerId: string,
  deliveryMethod: 'email' | 'sms',
  deliveredTo: string
): Promise<{ token: string; error?: string }> {
  const supabase = createServerClient();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing magic links for this customer
  await supabase
    .from('magic_links')
    .delete()
    .eq('customer_id', customerId);

  // Create new magic link
  const { error } = await supabase
    .from('magic_links')
    .insert({
      customer_id: customerId,
      token_hash: tokenHash,
      delivery_method: deliveryMethod,
      delivered_to: deliveredTo,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    return { token: '', error: error.message };
  }

  return { token };
}

// Verify magic link token
export async function verifyMagicLink(token: string): Promise<{ customerId?: string; error?: string }> {
  const supabase = createServerClient();
  const tokenHash = hashToken(token);

  // Find magic link
  const { data: magicLink, error } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .single();

  if (error || !magicLink) {
    return { error: 'Invalid or expired link' };
  }

  // Check if expired
  if (new Date(magicLink.expires_at) < new Date()) {
    return { error: 'Link has expired' };
  }

  // Mark as used
  await supabase
    .from('magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', magicLink.id);

  return { customerId: magicLink.customer_id };
}

// Send magic link via email
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
  const verifyUrl = `${portalUrl}/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Oostream <noreply@ooustick.com>',
      to: email,
      subject: 'Your Oostream Login Link',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Oostream</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Customer Portal</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${customerName},</p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Click the button below to log in to your Oostream customer portal. This link will expire in 15 minutes.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Log In to Portal
                </a>
              </div>
              <p style="font-size: 14px; color: #999; text-align: center;">
                If you didn't request this login link, you can safely ignore this email.
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                &copy; ${new Date().getFullYear()} Oostream. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send magic link via SMS
export async function sendMagicLinkSMS(
  phone: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
  const verifyUrl = `${portalUrl}/verify?token=${token}`;

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'SMS not configured' };
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: fromNumber,
          Body: `Your Oostream login link (expires in 15 min): ${verifyUrl}`,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
