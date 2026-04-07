import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
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
    // Don't throw — email failure shouldn't block auth flow in dev
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`[DEV] OTP email would have been sent to ${to}. Check console for OTP.`);
      return null;
    }
    throw error;
  }
};
