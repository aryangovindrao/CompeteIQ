import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'CompeteIQ <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function isEmailConfigured(): boolean {
  return !!apiKey;
}

/**
 * Sends an email. When RESEND_API_KEY is unset, falls back to `console.log`
 * so dev/CI still works without leaking errors. Returns true on success.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const c = getClient();
  if (!c) {
    // Dev fallback so flows aren't blocked.
    console.log('\n[email:DEV-MODE] (no RESEND_API_KEY set)');
    console.log(`  To:      ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log(`  Body:    ${opts.text ?? stripHtml(opts.html).slice(0, 400)}\n`);
    return true;
  }
  try {
    const result = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (result.error) {
      console.error('[email] resend rejected', result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] send failed', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Templated emails
// ---------------------------------------------------------------------------

function wrap(title: string, body: string, ctaLabel?: string, ctaHref?: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1A1A1A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden">
        <tr><td style="padding:32px 32px 0;border-bottom:1px solid #E5E7EB;background:#F9EBEA">
          <span style="display:inline-block;font-weight:800;font-size:20px;color:#C0392B;letter-spacing:-.5px">CompeteIQ</span>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1A1A1A">${title}</h1>
          <div style="font-size:15px;line-height:1.6;color:#374151">${body}</div>
          ${
            ctaLabel && ctaHref
              ? `<p style="margin:28px 0 0"><a href="${ctaHref}" style="display:inline-block;background:#C0392B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:15px">${ctaLabel}</a></p>`
              : ''
          }
        </td></tr>
        <tr><td style="padding:20px 32px;background:#F9FAFB;color:#6B7280;font-size:12px;line-height:1.5;border-top:1px solid #E5E7EB">
          You're receiving this email because of activity on your CompeteIQ account.
          If this wasn't you, you can safely ignore this message.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: 'Verify your CompeteIQ email',
    html: wrap(
      `Welcome, ${escape(name)}!`,
      `<p>Confirm this email address to activate your CompeteIQ account. This link expires in 24 hours.</p>`,
      'Verify my email',
      link,
    ),
    text: `Welcome to CompeteIQ! Verify your email: ${link}`,
  });
}

export function sendPasswordResetEmail(to: string, name: string, otp: string) {
  return sendEmail({
    to,
    subject: 'Your CompeteIQ password reset code',
    html: wrap(
      `Hi ${escape(name)},`,
      `<p>Use this 6-digit code to reset your password. It expires in 15 minutes.</p>
       <p style="margin:24px 0;font-size:32px;font-weight:800;letter-spacing:6px;color:#C0392B;background:#F9EBEA;padding:16px 24px;border-radius:10px;display:inline-block;font-family:ui-monospace,monospace">${otp}</p>
       <p style="color:#6B7280;font-size:13px">If you didn't request this, you can ignore the email — your password won't change.</p>`,
    ),
    text: `Your CompeteIQ password reset code is ${otp} (expires in 15 minutes).`,
  });
}

export function sendTeacherInviteEmail(to: string, instituteName: string, inviterName: string, signupLink: string) {
  return sendEmail({
    to,
    subject: `You've been invited to ${instituteName} on CompeteIQ`,
    html: wrap(
      `You're invited to ${escape(instituteName)}`,
      `<p>${escape(inviterName)} invited you to join <strong>${escape(instituteName)}</strong> as a teacher on CompeteIQ.</p>
       <p>Click below to accept the invite and set up your account.</p>`,
      'Accept invite',
      signupLink,
    ),
    text: `${inviterName} invited you to ${instituteName} on CompeteIQ: ${signupLink}`,
  });
}

export function sendCertificateReadyEmail(to: string, name: string, competitionTitle: string, certificateId: string) {
  const link = `${APP_URL}/verify/${certificateId}`;
  return sendEmail({
    to,
    subject: `Your ${competitionTitle} certificate is ready`,
    html: wrap(
      `Congratulations, ${escape(name)}!`,
      `<p>You've earned a certificate for <strong>${escape(competitionTitle)}</strong>. View it, share it, or download the PDF.</p>`,
      'View certificate',
      link,
    ),
    text: `Your certificate for ${competitionTitle} is ready: ${link}`,
  });
}

/** Tiny HTML-escape — only used for plain-text values we splice into templates. */
function escape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
