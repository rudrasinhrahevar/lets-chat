import logger from '../utils/logger.js';

export const sendNotification = async (userId, notification) => {
  try {
    // In-app notification via socket
    const io = global.io;
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
    return true;
  } catch (error) {
    logger.error('Notification send failed:', error.message);
    return false;
  }
};
