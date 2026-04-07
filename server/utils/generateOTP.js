import crypto from 'crypto';

export const generateOTP = (length = 6) => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
