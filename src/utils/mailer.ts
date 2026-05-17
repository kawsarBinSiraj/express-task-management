/**
 * File: src/utils/mailer.ts
 * Purpose: Nodemailer transporter and email-sending helpers.
 */

import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: 'Reset your password',
    text: `You requested a password reset. Click the link below (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Reset password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};
