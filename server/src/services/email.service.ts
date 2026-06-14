import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    logger.warn('EMAIL not configured — emails will be skipped');
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  });
  return transporter;
}

/* -------------------- HTML templates -------------------- */
function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:32px;">
      <h1 style="color:#1a73e8;margin:0 0 16px;">Yatra</h1>
      <h2 style="color:#333;margin:0 0 16px;">${title}</h2>
      ${body}
      <hr style="margin:24px 0;border:0;border-top:1px solid #eee;">
      <p style="color:#888;font-size:12px;">Yatra · Hotels & Travel · Nepal</p>
    </div></body></html>`;
}

function bookingTemplate(args: {
  userName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  totalPrice: number;
}): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed — ${args.hotelName}`,
    html: wrap(
      'Booking Confirmed 🎉',
      `<p>Hi ${args.userName},</p>
       <p>Your booking at <strong>${args.hotelName}</strong> is confirmed.</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Check-in</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${args.checkIn}</td></tr>
         <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Check-out</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${args.checkOut}</td></tr>
         <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Rooms</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${args.rooms}</td></tr>
         <tr><td style="padding:8px;"><strong>Total</strong></td><td style="padding:8px;">NPR ${args.totalPrice.toLocaleString()}</td></tr>
       </table>
       <p>Safe travels!</p>`,
    ),
  };
}

function otpTemplate(otp: string, type: string): { subject: string; html: string } {
  const label = type === 'verification' ? 'Verify Your Email' : type === 'password_reset' ? 'Reset Your Password' : 'Confirm Email Change';
  return {
    subject: `${label} — Code: ${otp}`,
    html: wrap(
      label,
      `<p>Your one-time code is:</p>
       <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#f0f4ff;padding:16px;border-radius:8px;color:#1a73e8;">${otp}</div>
       <p style="margin-top:16px;color:#555;">This code expires in 10 minutes. Do not share it with anyone.</p>`,
    ),
  };
}

function genericTemplate(subject: string, message: string): { subject: string; html: string } {
  return { subject, html: wrap(subject, `<p>${message}</p>`) };
}



/* -------------------- Public API -------------------- */

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER ?? 'noreply@yatra.local'}>`,
      to,
      subject,
      html,
    });
    logger.debug({ to, subject }, 'email sent');

  } catch (e) {
    logger.error({ to, subject, error: e }, 'email failed');
  }
}

export const emailService = {
  sendOtp: async (to: string, otp: string, type: string) => {
    const { subject, html } = otpTemplate(otp, type);
    await sendMail(to, subject, html);
  },

  sendBookingConfirmation: async (
    to: string,
    args: Parameters<typeof bookingTemplate>[0],
  ): Promise<void> => {
    const { subject, html } = bookingTemplate(args);
    await sendMail(to, subject, html);
  },

  sendGeneric: async (to: string, subject: string, message: string): Promise<void> => {
    const { subject: s, html } = genericTemplate(subject, message);
    await sendMail(to, s, html);
  },
};
