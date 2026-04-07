import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { initializeSocket } from './services/socket.service.js';
import logger from './utils/logger.js';

// ─── MongoDB Connection ───
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
    });
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Auto-reconnecting...');
});
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

// ─── HTTP + Socket.IO Server ───
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  // Low-bandwidth optimizations
  perMessageDeflate: {
    threshold: 1024, // only compress messages > 1KB
  },
  maxHttpBufferSize: 1e7, // 10MB max for socket payloads
});

global.io = io;

initializeSocket(io);

const PORT = process.env.PORT || 3001;

// ─── Graceful Shutdown (Render sends SIGTERM) ───
const gracefulShutdown = async (signal) => {
  logger.warn(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  // Close all socket connections
  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  // Wait for in-flight requests (max 10s)
  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (err) {
    logger.error(`Shutdown error: ${err.message}`);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

// ─── Start Server ───
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.success(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});

export { io };
