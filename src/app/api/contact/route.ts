import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

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

    // Send email via SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const adminEmail = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'oouchie@1865freemoney.com';

      await sgMail.send({
        to: adminEmail,
        from: process.env.EMAIL_FROM || 'Ooustream <oouchie@1865freemoney.com>',
        replyTo: email,
        subject: `Trial Request / Contact Form - ${name}`,
        html: `
          <div style="background:#0a0a0f;color:#f1f5f9;font-family:sans-serif;padding:24px;border-radius:8px;">
            <h2 style="color:#00d4ff;margin-top:0;">New Trial Request</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#94a3b8;width:120px;">Name:</td><td style="padding:8px 0;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Email:</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#00d4ff;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Phone:</td><td style="padding:8px 0;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Device:</td><td style="padding:8px 0;">${device || 'Not specified'}</td></tr>
            </table>
            <div style="margin-top:16px;">
              <p style="color:#94a3b8;margin-bottom:8px;">Message:</p>
              <p style="background:#12121a;padding:16px;border-radius:8px;border-left:3px solid #00d4ff;">${message}</p>
            </div>
          </div>
        `,
      });
    } else {
      // Log to console in development
      console.log('Contact form submission (SendGrid not configured):', {
        name, email, phone, device, message,
      });
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
