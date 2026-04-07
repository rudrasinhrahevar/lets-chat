import jwt from 'jsonwebtoken';

export const generateTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
