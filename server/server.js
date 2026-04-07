import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { initializeSocket } from './services/socket.service.js';
import logger from './utils/logger.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Reconnecting...');
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

global.io = io;

initializeSocket(io);

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
  });
});

export { io };
