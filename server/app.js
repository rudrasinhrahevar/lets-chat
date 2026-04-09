import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalLimiter, authLimiter } from './middleware/rateLimit.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.routes.js';
import statusRoutes from './routes/status.routes.js';
import callRoutes from './routes/call.routes.js';
import mediaRoutes from './routes/media.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { cacheMiddleware } from './middleware/cache.middleware.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://lets-chat-delta.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());

// Cache headers for API responses
app.use('/api/', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'private, max-age=0, must-revalidate');
    res.set('Vary', 'Authorization');
  } else {
    res.set('Cache-Control', 'no-store');
  }
  next();
});
app.use(cookieParser());

app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/calls', callRoutes);

// Apply response caching to frequently-hit read endpoints
app.get('/api/chats', cacheMiddleware(15));
app.get('/api/calls/history', cacheMiddleware(30));
app.use('/api/media', mediaRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use(errorHandler);

export default app;
