import jwt from 'jsonwebtoken';

export const generateTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

export const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    // In production with separate frontend/backend origins (e.g. Vercel),
    // refresh cookie must be cross-site.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
