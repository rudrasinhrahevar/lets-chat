import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import dns from 'dns';

// Prefer IPv4 to avoid ENETUNREACH on environments without IPv6 routing
// (common on some Windows networks and certain hosting setups).
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  // Prevent signup/login requests from hanging if SMTP is slow/misconfigured.
  connectionTimeout: 15000,
  socketTimeout: 15000,
  // Force IPv4 when available; avoids nodemailer choosing AAAA records.
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.VITE_APP_NAME || 'ChatApp'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    logger.success(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${to}:`, error.message);
    // Never throw from email delivery: auth flow should not depend on SMTP.
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`[DEV] OTP email would have been sent to ${to}. Check console for OTP.`);
    }
    return null;
  }
};
