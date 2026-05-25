"use strict";
/**
 * File: src/utils/mailer.ts
 * Purpose: Nodemailer transporter and email-sending helpers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: config_1.default.email.port,
    secure: config_1.default.email.secure,
    auth: {
        user: config_1.default.email.user,
        pass: config_1.default.email.pass,
    },
});
const sendPasswordResetEmail = async (to, resetUrl) => {
    await transporter.sendMail({
        from: config_1.default.email.from,
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
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=mailer.js.map