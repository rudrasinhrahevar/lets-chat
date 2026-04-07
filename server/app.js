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

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use(errorHandler);

export default app;
