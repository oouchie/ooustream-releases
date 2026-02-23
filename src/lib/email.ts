import sgMail from '@sendgrid/mail';

let _sgInitialized = false;

function initSendGrid() {
  if (!_sgInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    _sgInitialized = true;
  }
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'Ooustream <oouchie@1865freemoney.com>';
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://ooustick.com';
const ADMIN_EMAIL = 'info@ooustick.com';

function brandHeader(): string {
  return `
    <div style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <img src="https://ooustick.com/logo-iptv.png" alt="Ooustick" style="height: 120px; width: auto;" />
    </div>`;
}

function brandFooter(): string {
  return `
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">Ooustream &copy; ${new Date().getFullYear()}</p>
    </div>`;
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    ${brandHeader()}
    <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
      ${content}
    </div>
    ${brandFooter()}
  </body>
</html>`;
}

// Send welcome email to new customer after payment
export async function sendWelcomeEmail({
  email,
  name,
  planType,
  billingPeriod,
  expiryDate,
}: {
  email: string;
  name: string;
  planType: string;
  billingPeriod: string;
  expiryDate: string;
}): Promise<void> {
  initSendGrid();

  const planLabel = planType === 'pro' ? 'Pro' : 'Standard';
  const periodLabels: Record<string, string> = {
    monthly: '1 Month',
    '6month': '6 Months',
    yearly: '1 Year',
  };
  const periodLabel = periodLabels[billingPeriod] || billingPeriod;
  const formattedExpiry = new Date(expiryDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const content = `
    <h2 style="color: #111827; margin-top: 0;">Welcome to Ooustream, ${name}!</h2>
    <p style="color: #4b5563;">Your payment has been received and your account is now active.</p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #4b5563;">Plan: <strong style="color: #111827;">${planLabel}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Period: <strong style="color: #111827;">${periodLabel}</strong></p>
      <p style="margin: 0; color: #4b5563;">Active Until: <strong style="color: #111827;">${formattedExpiry}</strong></p>
    </div>

    <p style="color: #4b5563;">Your login credentials are being set up and will be sent to you shortly in a separate email.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${PORTAL_URL}" style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Visit Portal
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="color: #4b5563; margin-bottom: 0;"><strong>What's next:</strong></p>
    <ul style="color: #4b5563; margin-top: 8px;">
      <li>Your credentials will be sent to this email once set up</li>
      <li>Check the portal for setup guides and tutorials</li>
      <li>Use the support page if you need any help</li>
    </ul>

    <p style="color: #9ca3af; font-size: 14px; margin-top: 24px; margin-bottom: 0;">
      Questions? Reply to this email or open a support ticket in the portal.
    </p>`;

  await sgMail.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Welcome to Ooustream - Payment Confirmed',
    html: emailWrapper(content),
  });
}

// Notify admin about new customer signup
export async function sendNewCustomerNotification({
  customerEmail,
  customerName,
  planType,
  billingPeriod,
  amount,
  source,
}: {
  customerEmail: string;
  customerName: string;
  planType: string;
  billingPeriod: string;
  amount: number;
  source: string;
}): Promise<void> {
  initSendGrid();

  const planLabel = planType === 'pro' ? 'Pro' : 'Standard';
  const periodLabels: Record<string, string> = {
    monthly: '1 Month',
    '6month': '6 Months',
    yearly: '1 Year',
  };

  const content = `
    <h2 style="color: #111827; margin-top: 0;">New Customer Signup</h2>
    <p style="color: #4b5563;">A new customer just signed up and paid via the ${source}.</p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #4b5563;">Name: <strong style="color: #111827;">${customerName}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Email: <strong style="color: #111827;">${customerEmail}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Plan: <strong style="color: #111827;">${planLabel}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Period: <strong style="color: #111827;">${periodLabels[billingPeriod] || billingPeriod}</strong></p>
      <p style="margin: 0; color: #4b5563;">Amount: <strong style="color: #111827;">$${(amount / 100).toFixed(2)}</strong></p>
    </div>

    <p style="color: #ef4444; font-weight: 600;">Action needed: Set up credentials for this customer in the CRM and send them.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_CRM_URL || 'https://ooustream-crm.vercel.app'}" style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Open CRM
      </a>
    </div>`;

  await sgMail.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `New Signup: ${customerName} - ${planLabel} (${periodLabels[billingPeriod] || billingPeriod})`,
    html: emailWrapper(content),
  });
}

// Notify customer about admin reply on their ticket
export async function sendTicketReplyNotification({
  customerEmail,
  customerName,
  ticketId,
  ticketNumber,
  subject,
  replyMessage,
}: {
  customerEmail: string;
  customerName: string;
  ticketId: string;
  ticketNumber: string;
  subject: string;
  replyMessage: string;
}): Promise<void> {
  initSendGrid();

  const content = `
    <h2 style="color: #111827; margin-top: 0;">New Reply on Your Ticket</h2>
    <p style="color: #4b5563;">Hi ${customerName}, our support team has replied to your ticket.</p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #4b5563;">Ticket: <strong style="color: #111827;">#${ticketNumber}</strong></p>
      <p style="margin: 0; color: #4b5563;">Subject: <strong style="color: #111827;">${subject}</strong></p>
    </div>

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #00d4ff;">
      <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${replyMessage}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${PORTAL_URL}/support/${ticketId}" style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        View Ticket
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 14px; margin-top: 24px; margin-bottom: 0;">
      You can reply directly in your portal or respond to this email.
    </p>`;

  await sgMail.send({
    from: EMAIL_FROM,
    to: customerEmail,
    subject: `Re: Ticket #${ticketNumber} - ${subject}`,
    html: emailWrapper(content),
  });
}

// Notify admin about new support ticket
export async function sendSupportTicketNotification({
  customerName,
  customerEmail,
  ticketNumber,
  subject,
  category,
  description,
}: {
  customerName: string;
  customerEmail: string;
  ticketNumber: string;
  subject: string;
  category: string;
  description: string;
}): Promise<void> {
  initSendGrid();

  const content = `
    <h2 style="color: #111827; margin-top: 0;">New Support Ticket</h2>
    <p style="color: #4b5563;">A customer submitted a new support ticket.</p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #4b5563;">Ticket: <strong style="color: #111827;">#${ticketNumber}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Customer: <strong style="color: #111827;">${customerName}</strong> (${customerEmail})</p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Category: <strong style="color: #111827;">${category}</strong></p>
      <p style="margin: 0 0 8px 0; color: #4b5563;">Subject: <strong style="color: #111827;">${subject}</strong></p>
    </div>

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #00d4ff;">
      <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${description}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${PORTAL_URL}/admin/tickets" style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        View in Admin
      </a>
    </div>`;

  await sgMail.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `Support Ticket #${ticketNumber}: ${subject}`,
    html: emailWrapper(content),
  });
}
