const emailService = require('./emailService');
const config = require('../config/env');

/**
 * Send transactional email notifications using unified hardened SMTP dispatcher
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const res = await emailService.dispatchEmail({
    to,
    subject,
    html,
    text,
    senderName: 'CommercePilot AI'
  });

  if (!res.success && !config.smtp.host) {
    return { skipped: true, reason: 'SMTP_SIMULATED_DEV' };
  }
  return res;
};

/**
 * Send email verification link
 */
const sendVerificationEmail = async ({ to, token, name }) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const subject = 'Verify your CommercePilot AI account';
  const text = `Hello ${name || 'Merchant'},\n\nThank you for registering with CommercePilot AI.\nPlease verify your email address by opening the following link:\n${verifyUrl}\n\nThis verification link expires in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070B14; color: #FFFFFF; padding: 32px; border-radius: 12px;">
      <h2 style="color: #6366F1; margin-bottom: 16px;">Verify Your CommercePilot AI Account</h2>
      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.5;">Hello ${name || 'Merchant'},</p>
      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.5;">Thank you for registering with CommercePilot AI. To activate all operational features, please verify your business email address by clicking below:</p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #94A3B8; font-size: 12px;">Or copy and paste this link in your browser: <br/><a href="${verifyUrl}" style="color: #60A5FA;">${verifyUrl}</a></p>
      <p style="color: #64748B; font-size: 11px; margin-top: 24px;">This link will expire in 24 hours.</p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, token, name }) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const subject = 'Reset your CommercePilot AI password';
  const text = `Hello ${name || 'Merchant'},\n\nA password reset was requested for your CommercePilot AI account.\nPlease reset your password by opening the following link:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #070B14; color: #FFFFFF; padding: 32px; border-radius: 12px;">
      <h2 style="color: #8B5CF6; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.5;">Hello ${name || 'Merchant'},</p>
      <p style="color: #CBD5E1; font-size: 15px; line-height: 1.5;">We received a request to reset your password. Click the button below to choose a new password:</p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #94A3B8; font-size: 12px;">Or copy and paste this URL: <br/><a href="${resetUrl}" style="color: #60A5FA;">${resetUrl}</a></p>
      <p style="color: #64748B; font-size: 11px; margin-top: 24px;">This link is valid for 1 hour. If you did not make this request, you can safely ignore this message.</p>
    </div>
  `;

  return sendEmail({ to, subject, html, text });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
