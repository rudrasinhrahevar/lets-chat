import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { sendEmail } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTokens, setRefreshCookie } from '../utils/generateToken.js';
import { generateOTP } from '../utils/generateOTP.js';
import logger from '../utils/logger.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be 8+ characters' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const otp = generateOTP();
  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    name, email,
    password: hashed,
    otp: await bcrypt.hash(otp, 8),
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
  });

  logger.info(`[DEV] OTP for ${email}: ${otp}`);

  await sendEmail({
    to: email,
    subject: 'Verify your account',
    text: `Your OTP is: ${otp}. Expires in 5 minutes.`,
    html: `<h2>Welcome to ChatApp!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`
  });

  res.status(201).json({ success: true, message: 'OTP sent to email', userId: user._id });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId).select('+otp +otpExpiry');
  if (!user || !user.otp) return res.status(400).json({ success: false, message: 'Invalid request' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });
  const valid = await bcrypt.compare(otp, user.otp);
  if (!valid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, accessToken, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (user.isBanned) return res.status(403).json({ success: false, message: 'Account suspended: ' + user.banReason });
  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(429).json({ success: false, message: 'Account locked. Try again later.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isVerified) return res.status(403).json({ success: false, message: 'Please verify your email first' });
  if (user.twoStepEnabled) return res.status(200).json({ success: false, requiresTwoStep: true, userId: user._id });

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, accessToken, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, theme: user.theme } });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
  setRefreshCookie(res, newRefresh);
  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out' });
});

export const setupTwoStep = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  if (!/^\d{6}$/.test(pin)) return res.status(400).json({ success: false, message: 'PIN must be 6 digits' });
  const hashed = await bcrypt.hash(pin, 10);
  await User.findByIdAndUpdate(req.user._id, { twoStepPin: hashed, twoStepEnabled: true });
  res.json({ success: true, message: 'Two-step verification enabled' });
});

export const verifyTwoStep = asyncHandler(async (req, res) => {
  const { userId, pin } = req.body;
  const user = await User.findById(userId).select('+twoStepPin');
  if (!user) return res.status(400).json({ success: false, message: 'User not found' });
  const valid = await bcrypt.compare(pin, user.twoStepPin);
  if (!valid) return res.status(400).json({ success: false, message: 'Incorrect PIN' });
  const { accessToken, refreshToken } = generateTokens(user._id);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, accessToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 8);
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  logger.info(`[DEV] Reset OTP for ${email}: ${otp}`);

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    text: `Your reset OTP is: ${otp}. Expires in 5 minutes.`
  });

  res.json({ success: true, message: 'Reset OTP sent to email', userId: user._id });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be 8+ characters' });

  const user = await User.findById(userId).select('+otp +otpExpiry');
  if (!user || !user.otp) return res.status(400).json({ success: false, message: 'Invalid request' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });
  const valid = await bcrypt.compare(otp, user.otp);
  if (!valid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

  user.password = await bcrypt.hash(newPassword, 12);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});
