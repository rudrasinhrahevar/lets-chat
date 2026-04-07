import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account suspended' });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const agentOrAdmin = (req, res, next) => {
  if (!['admin', 'agent'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Agent access required' });
  }
  next();
};
