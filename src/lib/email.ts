import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 587);

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"VCET NSDC" <noreply@vcetnsdc.com>';

  if (!transporter) {
    console.log(`[Email Service (Dev Simulation)] Would send email to: ${to}`);
    console.log(`[Subject]: ${subject}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] Successfully delivered to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err);
    return false;
  }
}

/**
 * Send notification when participant submits event registration form
 */
export async function sendRegistrationSubmissionEmail({
  email,
  name,
  squadName,
  eventTitle,
}: {
  email: string;
  name: string;
  squadName: string;
  eventTitle: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d0d18; color: #ffffff; padding: 30px; borderRadius: 16px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #a855f7; font-size: 26px; margin: 0;">VCET NSDC</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Registration Submission Received</p>
      </div>

      <div style="background-color: #161626; border: 1px solid #334155; padding: 25px; border-radius: 12px;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hello ${name},</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          Your registration for <strong style="color: #c084fc;">${eventTitle}</strong> (Squad: <strong style="color: #38bdf8;">${squadName}</strong>) has been successfully received and is currently under review by our admin team.
        </p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          We are verifying your submission and payment proof. You will receive an official confirmation email once your squad is approved.
        </p>
      </div>

      <div style="text-align: center; margin-top: 25px; color: #64748b; font-size: 12px;">
        <p>© ${new Date().getFullYear()} VCET NSDC. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[Received] Registration Submission for ${eventTitle}`,
    html,
  });
}

/**
 * Send notification when admin approves event registration
 */
export async function sendRegistrationApprovedEmail({
  email,
  name,
  squadName,
  eventTitle,
}: {
  email: string;
  name: string;
  squadName: string;
  eventTitle: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d0d18; color: #ffffff; padding: 30px; borderRadius: 16px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #10b981; font-size: 26px; margin: 0;">🎉 Registration Approved!</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">VCET NSDC Official Confirmation</p>
      </div>

      <div style="background-color: #161626; border: 1px solid #059669; padding: 25px; border-radius: 12px;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Congratulations ${name}!</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          Your squad <strong style="color: #38bdf8;">${squadName}</strong> has been <strong style="color: #34d399;">OFFICIALLY APPROVED</strong> for <strong style="color: #c084fc;">${eventTitle}</strong>!
        </p>
        <div style="background-color: #064e3b; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #a7f3d0; font-weight: bold; margin: 0; font-size: 16px;">Status: APPROVED & CONFIRMED ✓</p>
        </div>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Get ready with your team. Further event instructions, schedules, and details will be shared soon. We look forward to seeing you at the event!
        </p>
      </div>

      <div style="text-align: center; margin-top: 25px; color: #64748b; font-size: 12px;">
        <p>© ${new Date().getFullYear()} VCET NSDC. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🎉 Registration Approved for ${eventTitle}!`,
    html,
  });
}
