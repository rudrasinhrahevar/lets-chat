Pus# 🚀 MASTER PROMPT — COMPLETE WHATSAPP-LIKE WEB APP
#
# Full-Stack | React + Node.js + Socket.io + MongoDB | User Panel + Admin Panel
### Deployable on Free Tier (Render + Vercel + MongoDB Atlas + Cloudinary)

---

> **HOW TO USE THIS PROMPT:**
> Paste this entire prompt into Cursor AI, Claude, or any AI coding assistant.
> It will scaffold, build, and connect the entire application end-to-end.
> Follow Section order strictly for best results.

---

## 🧠 CONTEXT & OBJECTIVE

You are a senior full-stack engineer. Build a **production-grade WhatsApp-like web application** from scratch with:
- A **complete User Panel** (all WhatsApp user features)
- A **complete Admin/Business Panel** (management, analytics, automation)
- **Real-time communication** via Socket.io
- **Secure REST API** backend in Node.js + Express
- **MongoDB** as primary database
- **Cloudinary** for media storage (free tier)
- **Deployable for free** on Render (backend) + Vercel (frontend) + MongoDB Atlas

The app must be **college-demo ready**: visually polished, fully functional, and impressive. Code quality must be production-grade with proper error handling, security, and scalability.

---

## 📁 SECTION 1 — COMPLETE PROJECT STRUCTURE

Create the following folder/file structure **exactly**:

```
whatsapp-clone/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                  # Static images, icons, sounds
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Emoji.jsx
│   │   │   │   └── Tooltip.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── MessageReactions.jsx
│   │   │   │   ├── ReplyPreview.jsx
│   │   │   │   ├── MediaPreview.jsx
│   │   │   │   ├── VoiceRecorder.jsx
│   │   │   │   ├── ForwardModal.jsx
│   │   │   │   ├── MessageInfo.jsx
│   │   │   │   ├── SearchMessages.jsx
│   │   │   │   ├── DisappearingTimer.jsx
│   │   │   │   └── LiveLocation.jsx
│   │   │   ├── sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ChatList.jsx
│   │   │   │   ├── ChatListItem.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── NewChatModal.jsx
│   │   │   │   └── FilterTabs.jsx
│   │   │   ├── calls/
│   │   │   │   ├── CallScreen.jsx
│   │   │   │   ├── IncomingCall.jsx
│   │   │   │   ├── CallControls.jsx
│   │   │   │   └── VideoCall.jsx
│   │   │   ├── groups/
│   │   │   │   ├── GroupCreate.jsx
│   │   │   │   ├── GroupInfo.jsx
│   │   │   │   ├── GroupSettings.jsx
│   │   │   │   ├── MemberList.jsx
│   │   │   │   ├── GroupPolls.jsx
│   │   │   │   └── CommunityView.jsx
│   │   │   ├── status/
│   │   │   │   ├── StatusList.jsx
│   │   │   │   ├── StatusViewer.jsx
│   │   │   │   ├── StatusCreate.jsx
│   │   │   │   └── StatusRing.jsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfilePanel.jsx
│   │   │   │   ├── EditProfile.jsx
│   │   │   │   ├── PrivacySettings.jsx
│   │   │   │   ├── LinkedDevices.jsx
│   │   │   │   └── TwoStepVerify.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── ChatMonitor.jsx
│   │   │       ├── Analytics.jsx
│   │   │       ├── BroadcastPanel.jsx
│   │   │       ├── ReportsPanel.jsx
│   │   │       ├── BusinessProfile.jsx
│   │   │       ├── QuickReplies.jsx
│   │   │       ├── LabelManager.jsx
│   │   │       ├── CatalogManager.jsx
│   │   │       ├── AutomationRules.jsx
│   │   │       ├── AgentManagement.jsx
│   │   │       └── NotificationCenter.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   ├── ChatContext.jsx
│   │   │   ├── CallContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useChat.js
│   │   │   ├── useCall.js
│   │   │   ├── useMediaUpload.js
│   │   │   ├── useTyping.js
│   │   │   ├── useOnlineStatus.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useScrollBottom.js
│   │   │   ├── useVoiceRecorder.js
│   │   │   └── useNotification.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── OTPVerify.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── App/
│   │   │   │   └── AppLayout.jsx
│   │   │   └── Admin/
│   │   │       └── AdminApp.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── mediaService.js
│   │   │   ├── userService.js
│   │   │   └── adminService.js
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   ├── useCallStore.js
│   │   │   ├── useStatusStore.js
│   │   │   └── useAdminStore.js
│   │   ├── utils/
│   │   │   ├── formatTime.js
│   │   │   ├── formatFileSize.js
│   │   │   ├── encryptMessage.js
│   │   │   ├── generateThumbnail.js
│   │   │   ├── linkPreview.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── themes.css
│   │   │   └── animations.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   ├── socket.js
│   │   └── constants.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── chat.controller.js
│   │   ├── message.controller.js
│   │   ├── group.controller.js
│   │   ├── status.controller.js
│   │   ├── call.controller.js
│   │   ├── media.controller.js
│   │   ├── broadcast.controller.js
│   │   └── admin.controller.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Chat.model.js
│   │   ├── Message.model.js
│   │   ├── Group.model.js
│   │   ├── Status.model.js
│   │   ├── Call.model.js
│   │   ├── Media.model.js
│   │   ├── Broadcast.model.js
│   │   ├── Label.model.js
│   │   ├── QuickReply.model.js
│   │   ├── Catalog.model.js
│   │   ├── Poll.model.js
│   │   ├── Reaction.model.js
│   │   └── Admin.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── chat.routes.js
│   │   ├── message.routes.js
│   │   ├── group.routes.js
│   │   ├── status.routes.js
│   │   ├── call.routes.js
│   │   ├── media.routes.js
│   │   ├── broadcast.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── upload.middleware.js
│   │   ├── sanitize.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── cors.middleware.js
│   ├── services/
│   │   ├── socket.service.js
│   │   ├── notification.service.js
│   │   ├── email.service.js
│   │   ├── encryption.service.js
│   │   └── webrtc.service.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── generateOTP.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── app.js
│   ├── server.js
│   ├── seed.js
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
└── render.yaml
```

---

## 🗄️ SECTION 2 — DATABASE MODELS (MongoDB Schemas)

### User Model
```javascript
// server/models/User.model.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  about: { type: String, default: 'Hey there! I am using WhatsApp.' },
  role: { type: String, enum: ['user', 'admin', 'agent'], default: 'user' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  twoStepPin: { type: String, select: false },
  twoStepEnabled: { type: Boolean, default: false },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedDevices: [{ deviceId: String, deviceName: String, lastActive: Date }],
  privacy: {
    lastSeen: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    profilePhoto: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    about: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    status: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    readReceipts: { type: Boolean, default: true },
    groups: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' }
  },
  notifications: {
    messages: { type: Boolean, default: true },
    groups: { type: Boolean, default: true },
    calls: { type: Boolean, default: true },
    sound: { type: Boolean, default: true }
  },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  wallpaper: { type: String, default: '' },
  starredMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  businessProfile: {
    businessName: String,
    description: String,
    address: String,
    website: String,
    email: String,
    hours: String,
    category: String,
    isVerified: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ name: 'text' });
```

### Message Model
```javascript
// server/models/Message.model.js
const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['text','image','video','audio','voice','document','contact','location','sticker','gif','system'],
    default: 'text'
  },
  content: { type: String, default: '' },
  media: {
    url: String, publicId: String, thumbnail: String,
    filename: String, filesize: Number, duration: Number,
    mimeType: String, width: Number, height: Number
  },
  location: { lat: Number, lng: Number, address: String, isLive: Boolean },
  contact: { name: String, phone: String, avatar: String },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  isForwarded: { type: Boolean, default: false },
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  status: { type: Map, of: { delivered: Date, read: Date } },
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeletedForEveryone: { type: Boolean, default: false },
  disappearAt: Date,
  isViewOnce: { type: Boolean, default: false },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isStarred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mentionedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkPreview: { title: String, description: String, image: String, url: String },
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ content: 'text' });
```

### Chat Model
```javascript
// server/models/Chat.model.js
const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['private','group','broadcast','community'], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: { type: Map, of: Number, default: {} },
  isPinned: { type: Map, of: Boolean, default: {} },
  isArchived: { type: Map, of: Boolean, default: {} },
  isMuted: { type: Map, of: Date, default: {} },
  chatLock: { type: Map, of: Boolean, default: {} },
  disappearingMessages: { type: String, enum: ['off','24h','7d','90d'], default: 'off' },
  wallpaper: { type: Map, of: String, default: {} },
  groupInfo: {
    name: String,
    description: String,
    avatar: String,
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    superAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settings: {
      onlyAdminsCanMessage: { type: Boolean, default: false },
      onlyAdminsCanEditInfo: { type: Boolean, default: false },
      approvalRequired: { type: Boolean, default: false },
    },
    inviteLink: String,
    inviteLinkEnabled: { type: Boolean, default: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
  },
  broadcastInfo: {
    name: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });
```

### Status Model
```javascript
// server/models/Status.model.js
const statusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text','image','video','voice'], required: true },
  content: String,
  media: { url: String, publicId: String, thumbnail: String, duration: Number, mimeType: String },
  background: String,
  font: String,
  viewers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now },
    reaction: String
  }],
  privacy: { type: String, enum: ['everyone','contacts','selected','except'], default: 'everyone' },
  hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000), index: { expireAfterSeconds: 0 } }
}, { timestamps: true });
```

### Call Model
```javascript
// server/models/Call.model.js
const callSchema = new mongoose.Schema({
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  type: { type: String, enum: ['audio','video'], required: true },
  status: { type: String, enum: ['ringing','ongoing','ended','missed','rejected'], default: 'ringing' },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  roomId: String
}, { timestamps: true });
```

### Poll Model
```javascript
// server/models/Poll.model.js
const pollSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  options: [{
    text: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  allowMultiple: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  expiresAt: Date
}, { timestamps: true });
```

---

## ⚙️ SECTION 3 — BACKEND SETUP

### Entry Point (`server/server.js`)
```javascript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { initializeSocket } from './services/socket.service.js';
import app from './app.js';
import 'dotenv/config';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

initializeSocket(io);

connectDB().then(() => {
  httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});

export { io };
```

### Express App (`server/app.js`)
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
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
import errorHandler from './middleware/errorHandler.middleware.js';

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173'], credentials: true, methods: ['GET','POST','PUT','DELETE','PATCH'] }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

const globalLimit = rateLimit({ windowMs: 15*60*1000, max: 500 });
const authLimit = rateLimit({ windowMs: 15*60*1000, max: 20 });

app.use('/api/', globalLimit);
app.use('/api/auth', authLimit, authRoutes);
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
```

### MongoDB Connection (`server/config/db.js`)
```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

// Reconnection handling
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Reconnecting...');
  setTimeout(connectDB, 5000);
});

export default connectDB;
```

### Error Handler Middleware
```javascript
// server/middleware/errorHandler.middleware.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid ID format'; }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
```

### Auth Middleware
```javascript
// server/middleware/auth.middleware.js
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
```

---

## 🔌 SECTION 4 — COMPLETE SOCKET SERVICE

```javascript
// server/services/socket.service.js
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';
import Status from '../models/Status.model.js';
import Call from '../models/Call.model.js';

const userSocketMap = new Map(); // userId -> Set<socketId>
const callRooms = new Map();     // roomId -> { initiator, receiver, type }

export const initializeSocket = (io) => {

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    // Track multi-device sockets
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);

    // Mark online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
    socket.broadcast.emit('user:online', { userId });

    // Auto-join all user chats
    const chats = await Chat.find({ participants: userId }).select('_id');
    chats.forEach(chat => socket.join(`chat:${chat._id}`));

    // ─────────────────────────────────────────
    // MESSAGING
    // ─────────────────────────────────────────
    socket.on('message:send', async (data) => {
      const { chatId, tempId, content, type, media, replyTo, isViewOnce, disappearAt, mentionedUsers } = data;
      try {
        const message = await Message.create({
          chat: chatId, sender: userId, type: type || 'text',
          content, media, replyTo, isViewOnce, disappearAt, mentionedUsers
        });
        await message.populate([
          { path: 'sender', select: 'name avatar' },
          { path: 'replyTo', populate: { path: 'sender', select: 'name' } }
        ]);
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        // Deliver to room
        io.to(`chat:${chatId}`).emit('message:receive', message);
        socket.emit('message:sent', { tempId, messageId: message._id });

        // Increment unread for others
        const chat = await Chat.findById(chatId).select('participants');
        const updateOps = {};
        chat.participants.forEach(pid => {
          if (pid.toString() !== userId) {
            updateOps[`unreadCount.${pid}`] = 1;
          }
        });
        if (Object.keys(updateOps).length) {
          await Chat.findByIdAndUpdate(chatId, { $inc: updateOps });
        }
      } catch (err) {
        socket.emit('message:error', { tempId, error: err.message });
      }
    });

    socket.on('message:delivered', async ({ messageId, chatId }) => {
      await Message.findByIdAndUpdate(messageId, {
        [`status.${userId}.delivered`]: new Date()
      });
      socket.to(`chat:${chatId}`).emit('message:status', { messageId, userId, status: 'delivered' });
    });

    socket.on('message:read', async ({ chatId }) => {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId }, [`status.${userId}.read`]: { $exists: false } },
        { $set: { [`status.${userId}.read`]: new Date() } }
      );
      await Chat.findByIdAndUpdate(chatId, { [`unreadCount.${userId}`]: 0 });
      socket.to(`chat:${chatId}`).emit('message:read', { chatId, userId });
    });

    socket.on('message:react', async ({ messageId, chatId, emoji }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      const idx = message.reactions.findIndex(r => r.user.toString() === userId);
      if (idx !== -1) {
        if (message.reactions[idx].emoji === emoji) message.reactions.splice(idx, 1);
        else message.reactions[idx].emoji = emoji;
      } else {
        message.reactions.push({ user: userId, emoji });
      }
      await message.save();
      io.to(`chat:${chatId}`).emit('message:reacted', { messageId, reactions: message.reactions });
    });

    socket.on('message:edit', async ({ messageId, chatId, content }) => {
      const now = new Date();
      const msg = await Message.findById(messageId);
      if (!msg || msg.sender.toString() !== userId) return;
      const minutesOld = (now - msg.createdAt) / 1000 / 60;
      if (minutesOld > 15) return socket.emit('message:error', { error: 'Edit window expired' });
      await Message.findByIdAndUpdate(messageId, { content, isEdited: true, editedAt: now });
      io.to(`chat:${chatId}`).emit('message:edited', { messageId, content, editedAt: now });
    });

    socket.on('message:delete', async ({ messageId, chatId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        await Message.findOneAndUpdate(
          { _id: messageId, sender: userId },
          { isDeletedForEveryone: true, content: 'This message was deleted', media: null, type: 'system' }
        );
        io.to(`chat:${chatId}`).emit('message:deleted', { messageId, deleteForEveryone: true });
      } else {
        await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedFor: userId } });
        socket.emit('message:deleted', { messageId, deleteForEveryone: false });
      }
    });

    socket.on('message:forward', async ({ messageId, targetChatIds }) => {
      const original = await Message.findById(messageId);
      if (!original) return;
      for (const chatId of targetChatIds) {
        const forwarded = await Message.create({
          chat: chatId, sender: userId, type: original.type,
          content: original.content, media: original.media,
          isForwarded: true, forwardedFrom: original.chat
        });
        await forwarded.populate('sender', 'name avatar');
        await Chat.findByIdAndUpdate(chatId, { lastMessage: forwarded._id, updatedAt: new Date() });
        io.to(`chat:${chatId}`).emit('message:receive', forwarded);
      }
    });

    socket.on('message:star', async ({ messageId, star }) => {
      if (star) {
        await User.findByIdAndUpdate(userId, { $addToSet: { starredMessages: messageId } });
        await Message.findByIdAndUpdate(messageId, { $addToSet: { isStarred: userId } });
      } else {
        await User.findByIdAndUpdate(userId, { $pull: { starredMessages: messageId } });
        await Message.findByIdAndUpdate(messageId, { $pull: { isStarred: userId } });
      }
      socket.emit('message:starred', { messageId, star });
    });

    // ─────────────────────────────────────────
    // TYPING
    // ─────────────────────────────────────────
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', { chatId, userId });
    });
    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { chatId, userId });
    });

    // ─────────────────────────────────────────
    // WEBRTC CALLS
    // ─────────────────────────────────────────
    socket.on('call:initiate', async ({ targetUserId, chatId, callType }) => {
      const targetSockets = userSocketMap.get(targetUserId);
      if (!targetSockets?.size) return socket.emit('call:unavailable', { targetUserId });
      const roomId = `call:${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
      callRooms.set(roomId, { initiator: userId, receiver: targetUserId, chatId, callType, startedAt: null });
      socket.join(roomId);
      const caller = await User.findById(userId).select('name avatar');
      targetSockets.forEach(sid => {
        io.to(sid).emit('call:incoming', { callerId: userId, callerInfo: caller, chatId, callType, roomId });
      });
      socket.emit('call:ringing', { roomId, targetUserId });
      await Call.create({ initiator: userId, participants: [userId, targetUserId], chat: chatId, type: callType, roomId });
    });

    socket.on('call:accept', ({ roomId }) => {
      const room = callRooms.get(roomId);
      if (!room) return;
      room.startedAt = new Date();
      socket.join(roomId);
      io.to(roomId).emit('call:accepted', { roomId, acceptedBy: userId });
      Call.findOneAndUpdate({ roomId }, { status: 'ongoing', startedAt: new Date() }).exec();
    });

    socket.on('call:reject', async ({ roomId }) => {
      const room = callRooms.get(roomId);
      if (!room) return;
      io.to(roomId).emit('call:rejected', { roomId });
      callRooms.delete(roomId);
      await Call.findOneAndUpdate({ roomId }, { status: 'rejected', endedAt: new Date() });
    });

    socket.on('call:end', async ({ roomId }) => {
      const room = callRooms.get(roomId);
      io.to(roomId).emit('call:ended', { roomId });
      if (room?.startedAt) {
        const duration = Math.floor((new Date() - room.startedAt) / 1000);
        await Call.findOneAndUpdate({ roomId }, { status: 'ended', endedAt: new Date(), duration });
      }
      callRooms.delete(roomId);
    });

    socket.on('call:missed', async ({ roomId }) => {
      await Call.findOneAndUpdate({ roomId }, { status: 'missed', endedAt: new Date() });
      io.to(roomId).emit('call:missed', { roomId });
      callRooms.delete(roomId);
    });

    // WebRTC signaling
    socket.on('webrtc:offer', ({ roomId, offer }) => socket.to(roomId).emit('webrtc:offer', { offer, from: userId }));
    socket.on('webrtc:answer', ({ roomId, answer }) => socket.to(roomId).emit('webrtc:answer', { answer, from: userId }));
    socket.on('webrtc:ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('webrtc:ice-candidate', { candidate, from: userId }));

    // ─────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────
    socket.on('status:view', async ({ statusId, ownerId }) => {
      await Status.findByIdAndUpdate(statusId, {
        $addToSet: { viewers: { user: userId, viewedAt: new Date() } }
      });
      const ownerSockets = userSocketMap.get(ownerId);
      ownerSockets?.forEach(sid => io.to(sid).emit('status:viewed', { statusId, viewerId: userId }));
    });

    socket.on('status:react', async ({ statusId, ownerId, reaction }) => {
      await Status.findOneAndUpdate(
        { _id: statusId, 'viewers.user': userId },
        { $set: { 'viewers.$.reaction': reaction } }
      );
      const ownerSockets = userSocketMap.get(ownerId);
      ownerSockets?.forEach(sid => io.to(sid).emit('status:reaction', { statusId, from: userId, reaction }));
    });

    // ─────────────────────────────────────────
    // LIVE LOCATION
    // ─────────────────────────────────────────
    socket.on('location:live', ({ chatId, lat, lng, accuracy }) => {
      socket.to(`chat:${chatId}`).emit('location:live-update', { userId, lat, lng, accuracy, timestamp: new Date() });
    });

    // ─────────────────────────────────────────
    // GROUPS
    // ─────────────────────────────────────────
    socket.on('group:join', ({ groupId }) => socket.join(`chat:${groupId}`));
    socket.on('group:leave', ({ groupId }) => socket.leave(`chat:${groupId}`));
    socket.on('group:admin-action', ({ groupId, action, targetUserId }) => {
      io.to(`chat:${groupId}`).emit('group:updated', { action, targetUserId, by: userId });
    });

    // ─────────────────────────────────────────
    // PRESENCE & DISCONNECT
    // ─────────────────────────────────────────
    socket.on('disconnect', async () => {
      const sockets = userSocketMap.get(userId);
      sockets?.delete(socket.id);
      if (!sockets?.size) {
        userSocketMap.delete(userId);
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
        socket.broadcast.emit('user:offline', { userId, lastSeen });
      }
    });
  });
};

export const emitToUser = (io, userId, event, data) => {
  const sockets = userSocketMap.get(userId?.toString());
  sockets?.forEach(sid => io.to(sid).emit(event, data));
};
```

---

## 🔐 SECTION 5 — AUTH CONTROLLER

```javascript
// server/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import { sendEmail } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be 8+ characters' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    name, email,
    password: hashed,
    otp: await bcrypt.hash(otp, 8),
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendEmail({ to: email, subject: 'Verify your account', text: `Your OTP is: ${otp}. Expires in 5 minutes.` });

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

export const refreshToken = asyncHandler(async (req, res) => {
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
  res.clearCookie('refreshToken');
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
```

---

## 💬 SECTION 6 — COMPLETE API ROUTES

```
AUTH          POST /api/auth/register, /verify-otp, /login, /refresh-token, /logout, /forgot-password, /reset-password, /setup-2fa, /verify-2fa
USERS         GET/PUT /api/users/me, PUT /me/avatar, GET /search, GET /:id, PUT /privacy, /notifications, /theme, POST/DELETE /block/:id, GET /blocked, /starred-messages, /linked-devices, DELETE /linked-devices/:id
CHATS         GET /, POST /private, GET /:id, DELETE /:id/clear, PUT /:id/pin, /archive, /mute, /disappearing, /wallpaper, /lock
MESSAGES      GET /:chatId (paginated), POST /, PUT /:id, DELETE /:id, POST /:id/forward, /star, GET /search, /starred, /:chatId/media
GROUPS        POST /, GET /:id, PUT /:id, DELETE /:id, POST /:id/members, DELETE /:id/members/:userId, PUT /:id/admin/:userId, DELETE /:id/admin/:userId, POST /:id/leave, GET /:id/invite-link, POST /:id/invite-link/reset, POST /join/:code, POST /:id/polls, PUT /:id/polls/:pollId/vote, PUT /:id/settings, POST /:id/approve/:userId, GET /:id/join-requests
STATUS        GET /, POST /, GET /my, DELETE /:id, GET /:userId, POST /:id/react, PUT /:id/privacy
CALLS         GET /history, POST /log, GET /links, POST /links, DELETE /links/:id
MEDIA         POST /upload, /upload-multiple, DELETE /:publicId
BROADCASTS    POST /, GET /, DELETE /:id, POST /:id/send, GET /:id/stats
ADMIN         GET /stats, /users, GET/PUT /users/:id, PUT /users/:id/ban, /unban, /role, DELETE /users/:id, GET /chats, /messages, /reports, PUT /reports/:id/resolve, GET /analytics, POST /broadcast, GET/POST /agents, DELETE /agents/:id, CRUD /labels, /quick-replies, /catalog, /automations
```

---

## 🎨 SECTION 7 — FRONTEND IMPLEMENTATION

### Dependencies (`client/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.8",
    "socket.io-client": "^4.7.5",
    "zustand": "^4.5.2",
    "@emoji-mart/react": "^1.1.1",
    "@emoji-mart/data": "^1.1.2",
    "react-hot-toast": "^2.4.1",
    "react-dropzone": "^14.2.3",
    "wavesurfer.js": "^7.7.3",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "framer-motion": "^11.1.1",
    "recharts": "^2.12.2",
    "react-intersection-observer": "^9.8.1",
    "simple-peer": "^9.11.1",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "dompurify": "^3.1.0",
    "linkifyjs": "^4.1.3"
  }
}
```

### Tailwind WhatsApp Theme
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wa: {
          teal:       '#00a884',
          'teal-dk':  '#008069',
          'teal-lt':  '#d9fdd3',
          green:      '#25D366',
          bg:         '#111b21',
          panel:      '#202c33',
          input:      '#2a3942',
          bubble:     '#005c4b',
          bubble2:    '#1e2d34',
          text:       '#e9edef',
          'text-sec': '#8696a0',
          border:     '#222d34',
          icon:       '#aebac1',
          read:       '#53bdeb',
          unread:     '#00a884',
          danger:     '#f15c6d',
        }
      },
      animation: {
        'slide-in':   'slideIn 0.2s ease-out',
        'fade-in':    'fadeIn 0.15s ease-out',
        'bounce-in':  'bounceIn 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'pulse-ring': 'pulseRing 1.5s infinite',
        'dot-1':      'typing 1.4s 0.0s infinite',
        'dot-2':      'typing 1.4s 0.2s infinite',
        'dot-3':      'typing 1.4s 0.4s infinite',
      },
      keyframes: {
        slideIn:   { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceIn:  { '0%': { transform: 'scale(0)' }, '80%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)' } },
        pulseRing: { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.4)', opacity: 0.4 } },
        typing:    { '0%,60%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-4px)' } }
      }
    }
  },
  plugins: []
}
```

### Zustand Auth Store
```javascript
// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setTokens: (accessToken) => set({ accessToken, isAuthenticated: true }),

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresTwoStep) return { requiresTwoStep: true, userId: data.userId };
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const { data } = await api.post('/auth/refresh-token');
      set({ accessToken: data.accessToken, isAuthenticated: true });
      return data.accessToken;
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
      return null;
    }
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } }))
}), { name: 'auth-store', partialize: (state) => ({ user: state.user }) }));
```

### Axios API Service with Interceptors
```javascript
// src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const token = await useAuthStore.getState().refreshToken();
        processQueue(null, token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Socket Context
```javascript
// src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { receiveMessage, updateMessageStatus, updateReactions, markRead } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    const socket = socketRef.current;

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', (reason) => console.warn('Socket disconnected:', reason));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socket.on('message:receive', (message) => receiveMessage(message));
    socket.on('message:sent', ({ tempId, messageId }) => useChatStore.getState().confirmSent(tempId, messageId));
    socket.on('message:status', updateMessageStatus);
    socket.on('message:read', ({ chatId, userId }) => markRead(chatId, userId));
    socket.on('message:reacted', updateReactions);
    socket.on('message:edited', useChatStore.getState().editMessage);
    socket.on('message:deleted', useChatStore.getState().deleteMessage);

    socket.on('typing:start', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, true));
    socket.on('typing:stop', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, false));

    socket.on('user:online', ({ userId }) => useChatStore.getState().setUserOnline(userId, true));
    socket.on('user:offline', ({ userId, lastSeen }) => useChatStore.getState().setUserOnline(userId, false, lastSeen));

    return () => socket.disconnect();
  }, [isAuthenticated, accessToken]);

  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
```

### Complete Chat Store (Zustand)
```javascript
// src/store/useChatStore.js
import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},      // { chatId: Message[] }
  typing: {},        // { chatId: Set<userId> }
  onlineUsers: {},   // { userId: { isOnline, lastSeen } }
  drafts: {},        // { chatId: string }

  setChats: (chats) => set({ chats }),

  setActiveChat: (chat) => set({ activeChat: chat }),

  receiveMessage: (message) => {
    set(state => {
      const chatId = message.chat;
      const existing = state.messages[chatId] || [];
      const msgs = [...existing, message];
      // Update chat's last message
      const chats = state.chats.map(c =>
        c._id === chatId ? { ...c, lastMessage: message, updatedAt: new Date() } : c
      );
      return { messages: { ...state.messages, [chatId]: msgs }, chats };
    });
  },

  confirmSent: (tempId, messageId) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === tempId ? { ...m, _id: messageId, status: 'sent' } : m
        );
      }
      return { messages: updated };
    });
  },

  loadMessages: (chatId, messages, prepend = false) => {
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: prepend
          ? [...messages, ...(state.messages[chatId] || [])]
          : messages
      }
    }));
  },

  addOptimisticMessage: (message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [message.chat]: [...(state.messages[message.chat] || []), message]
      }
    }));
  },

  updateMessageStatus: ({ messageId, userId, status }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId
            ? { ...m, status: { ...(m.status || {}), [userId]: { ...((m.status || {})[userId] || {}), [status]: new Date() } } }
            : m
        );
      }
      return { messages: updated };
    });
  },

  markRead: (chatId, userId) => {
    set(state => ({
      chats: state.chats.map(c => c._id === chatId ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c),
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map(m => ({
          ...m,
          status: { ...(m.status || {}), [userId]: { ...(m.status?.[userId] || {}), read: new Date() } }
        }))
      }
    }));
  },

  updateReactions: ({ messageId, reactions }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId ? { ...m, reactions } : m
        );
      }
      return { messages: updated };
    });
  },

  editMessage: ({ messageId, content, editedAt }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId ? { ...m, content, isEdited: true, editedAt } : m
        );
      }
      return { messages: updated };
    });
  },

  deleteMessage: ({ messageId, deleteForEveryone }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId
            ? deleteForEveryone
              ? { ...m, isDeletedForEveryone: true, content: 'This message was deleted', type: 'system' }
              : { ...m, isDeleted: true }
            : m
        );
      }
      return { messages: updated };
    });
  },

  setTyping: (chatId, userId, isTyping) => {
    set(state => {
      const current = new Set(state.typing[chatId] || []);
      isTyping ? current.add(userId) : current.delete(userId);
      return { typing: { ...state.typing, [chatId]: current } };
    });
  },

  setUserOnline: (userId, isOnline, lastSeen = null) => {
    set(state => ({
      onlineUsers: { ...state.onlineUsers, [userId]: { isOnline, lastSeen } }
    }));
  },

  setDraft: (chatId, text) => set(state => ({ drafts: { ...state.drafts, [chatId]: text } })),

  clearDraft: (chatId) => set(state => { const d = { ...state.drafts }; delete d[chatId]; return { drafts: d }; })
}));
```

---

## 🖥️ SECTION 8 — KEY UI COMPONENTS

### AppLayout (WhatsApp Web Two-Panel)
```jsx
// pages/App/AppLayout.jsx
export default function AppLayout() {
  const { activeChat } = useChatStore();
  const [view, setView] = useState('chats'); // 'chats' | 'status' | 'calls'

  return (
    <div className="flex h-screen bg-wa-bg text-wa-text overflow-hidden select-none">
      {/* LEFT PANEL */}
      <aside className={clsx(
        'flex flex-col border-r border-wa-border',
        'w-full md:w-[380px] lg:w-[420px] flex-shrink-0',
        activeChat ? 'hidden md:flex' : 'flex'
      )}>
        <SidebarHeader />
        <SearchBar />
        {view === 'chats'  && <><FilterTabs /><ChatList /></>}
        {view === 'status' && <StatusList />}
        {view === 'calls'  && <CallsList />}
        <BottomNav view={view} onChange={setView} />
      </aside>

      {/* RIGHT PANEL */}
      <main className={clsx(
        'flex-1 flex flex-col',
        activeChat ? 'flex' : 'hidden md:flex'
      )}>
        {activeChat ? <ChatWindow /> : <WelcomeScreen />}
      </main>

      {/* Overlays */}
      <IncomingCallAlert />
      <Toaster position="top-center" />
    </div>
  );
}
```

### ChatWindow (Complete)
```jsx
// components/chat/ChatWindow.jsx
export default function ChatWindow() {
  const { activeChat, messages, typing } = useChatStore();
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const chatMessages = messages[activeChat?._id] || [];
  const isTyping = [...(typing[activeChat?._id] || [])].length > 0;

  useEffect(() => {
    if (activeChat) {
      // Load messages, mark as read
      socket?.emit('message:read', { chatId: activeChat._id });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, chatMessages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader
        chat={activeChat}
        onSearchClick={() => setShowSearch(s => !s)}
        onInfoClick={() => setShowInfo(true)}
      />
      {showSearch && <SearchMessages chatId={activeChat._id} />}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        style={{ backgroundImage: `url(/chat-bg.png)`, backgroundSize: '400px' }}
      >
        {chatMessages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            prevMessage={chatMessages[i - 1]}
            onReply={() => setReplyTo(msg)}
            onEdit={() => setEditMsg(msg)}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        chatId={activeChat._id}
        replyTo={replyTo}
        editMsg={editMsg}
        onClearReply={() => setReplyTo(null)}
        onClearEdit={() => setEditMsg(null)}
      />

      {showInfo && <ChatInfoPanel chat={activeChat} onClose={() => setShowInfo(false)} />}
    </div>
  );
}
```

### MessageBubble (All types)
```jsx
// components/chat/MessageBubble.jsx
// Render based on message.type:
// 'text'     → DOMPurify sanitized text with linkify, emoji rendering
// 'image'    → thumbnail, click for fullscreen lightbox, download button
// 'video'    → thumbnail + play button, click to play in modal
// 'audio'/'voice' → wavesurfer waveform, play/pause, duration
// 'document' → file icon by extension, filename, size, download
// 'location' → mini map (react-leaflet), address text, open in maps
// 'contact'  → name, phone, "Add to contacts" button
// 'sticker'  → large emoji/image no background
// 'system'   → centered gray italic text (e.g. "This message was deleted")

// Context menu on right-click (desktop) or long-press (mobile):
// [Reply] [Forward] [React] [Copy] [Star] [Info] [Edit (own only, 15min)] [Delete]

// Tail: triangle on bubble corner (own=right, other=left)
// Time + ticks: ✓ sent, ✓✓ delivered, ✓✓(blue) read — only on own messages
// Forward badge: "Forwarded" with arrow icon
// Edit indicator: "Edited" in small text next to time
// Reply preview: collapsed quote at top of bubble
// Reactions: floating bar below bubble if any reactions exist
// Disappearing: countdown timer badge on bubble
// View once: lock icon until viewed, then "Opened" with eye
```

### ChatInput (Full-featured)
```jsx
// components/chat/ChatInput.jsx
// Features:
// - Contenteditable div (not textarea) for rich-ish input
// - Emoji picker (emoji-mart) on 😊 button
// - Attachment menu (paperclip): photos, videos, documents, contact, location, camera
// - Voice recorder on 🎤 button (switch to send when text present)
// - Reply preview bar above input when replying
// - Edit mode bar above input when editing
// - Typing emit: debounced, emit start on keystroke, stop after 2s idle
// - Draft save per chat in zustand
// - Paste image support (clipboard)
// - Mention autocomplete with @ trigger
// - Link preview auto-generated below input
```

### VoiceRecorder
```jsx
// components/chat/VoiceRecorder.jsx
// Uses MediaRecorder API
// Canvas waveform visualization with requestAnimationFrame
// Timer display (MM:SS)
// Swipe indicator: swipe left to cancel
// Locking: slide up to lock recording (keeps recording hands-free)
// On release (unlocked): sends immediately
// On send button (locked): sends
// On cancel: discards recording
// Playback preview before sending
// Output: audio/webm blob → upload to Cloudinary → send as 'voice' message
```

### Status Viewer (Stories-style)
```jsx
// components/status/StatusViewer.jsx
// Progress bars at top (one per status item)
// Auto advance: images=5s, video=full duration
// Tap left: previous, Tap right: next, Tap & hold: pause
// Swipe down: close
// Slide up: viewers list with reactions
// Bottom: reply text input + emoji reaction row
// Privacy badge (eye icon with count)
// Emit status:view on each new status shown
```

### WebRTC Call Screen
```jsx
// components/calls/CallScreen.jsx
// Uses simple-peer for WebRTC
// Local video (small, draggable overlay, bottom-right)
// Remote video (full screen)
// Overlay: participant name, call timer, network quality dots
// Controls bar (auto-hide after 3s, show on tap):
//   Mute mic | Toggle camera | Speaker | Flip camera | End call
// For audio call: large avatar instead of video
// Incoming call: slide-up modal with caller info, accept (green), reject (red)
// Call ended: show duration summary, call back button
```

---

## 🛡️ SECTION 9 — ADMIN PANEL

### Admin Dashboard (Real-time Stats)
```jsx
// components/admin/Dashboard.jsx
// Stat cards (real-time via socket):
//   Total Users | Active Now | New Today | Messages Today | Groups | Reported
// Charts (Recharts):
//   LineChart: messages per hour (last 24h) — live updating
//   AreaChart: user signups (last 30 days)
//   PieChart: message types breakdown (text/image/video/audio/doc)
//   BarChart: top 10 active users
// Live activity feed (socket-powered scrolling list)
// Recent abuse reports table with quick action buttons
// System health: DB status, socket connections count, uptime
```

### User Management
```jsx
// Complete DataTable with:
// Search + Filter (role, status, join date range, banned/active)
// Sort by: name, joined, last active, message count
// Row actions: View | Ban (with reason) | Unban | Change Role | Delete | View Chats
// Bulk: select all → Ban all / Export CSV
// User Detail Modal:
//   Profile info, contact, role badge
//   Activity stats: total messages, groups, last seen
//   Device list with revoke session
//   Ban history timeline
//   Recent chats list
//   Admin notes field
```

### Analytics Panel
```jsx
// Recharts dashboard:
// DAU/MAU ratio card
// LineChart: 30-day active users
// AreaChart: cumulative user growth
// BarChart: messages by day of week
// HeatMap (custom SVG): messages by hour × day
// PieChart: media sharing breakdown
// LineChart (multi): audio calls vs video calls volume
// Table: retention cohort (weekly)
// Date range picker for all charts
// Export to PNG/CSV button
```

### Automation Builder
```jsx
// Visual if-then rule builder:
// TRIGGER dropdown: New user joins | Message received | Keyword matched | Scheduled
// CONDITION builder: message contains [text] | user tagged [label] | time is [range]
// ACTION builder: Auto-reply [template] | Assign to [agent] | Add label [label] | Notify admin
// Multiple conditions with AND/OR logic
// Multiple actions per rule
// Test button: simulate trigger
// Enable/disable toggle
// Execution log per rule
```

---

## 🌐 SECTION 10 — DEPLOYMENT

### render.yaml (Backend — Render Free Tier)
```yaml
services:
  - type: web
    name: whatsapp-clone-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && node server.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: CLIENT_URL
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
```

### vercel.json (Frontend — Vercel Free Tier)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Environment Variables

**Server `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/whatsapp-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-64-char-hex-string
JWT_REFRESH_SECRET=another-super-secret-64-char-hex-string
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourapp@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=Admin@123456
```

**Client `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_APP_NAME=ChatApp
```

---

## 🌱 SECTION 11 — SEED DATA

```javascript
// server/seed.js — Run: node seed.js
// Creates:
// Admin: admin@demo.com / Admin@123
// 10 users: user1@demo.com through user10@demo.com / User@123
// 5 group chats with 50 sample messages each
// Sample statuses (text + image)
// 10 call history records
// Admin data: 5 labels, 10 quick replies, 5 catalog items, 3 automation rules
// All users are pre-verified (skip OTP for demo)
```

---

## 📋 SECTION 12 — IMPLEMENTATION ORDER

Build strictly in this sequence:

```
1.  Project init (server + client)
2.  MongoDB connection + all 14 models
3.  Middleware stack (auth, upload, rate limit, error)
4.  Auth controller + routes (complete)
5.  User controller + routes
6.  Chat + Message controllers
7.  Socket service (full 400+ line service)
8.  Group + Status + Call + Broadcast + Admin controllers
9.  Cloudinary upload middleware + media controller
10. React app init (Vite + Tailwind + Router)
11. Zustand stores (auth, chat, call, status, admin)
12. Axios service + interceptors
13. Socket context + all hooks
14. Auth pages (Login, Register, OTP, ForgotPw)
15. Protected routes + route guards
16. Sidebar + ChatList (with virtual scroll)
17. ChatWindow + MessageBubble (all 10 types)
18. ChatInput (emoji + voice + attachments)
19. Status page (list + viewer + creator)
20. Calls page + WebRTC call screen
21. Profile + Settings panel (all sections)
22. Admin panel (all 12 sections)
23. Seed file
24. Responsive polish + animations
25. Deployment configs + README
```

---

## ✅ SECTION 13 — QUALITY CHECKLIST

### Backend
- [ ] All routes protected with auth middleware
- [ ] Admin routes protected with adminOnly middleware
- [ ] Input validation on all POST/PUT endpoints
- [ ] Consistent API response shape: `{ success, data, message, pagination? }`
- [ ] Cursor-based pagination on messages (not offset)
- [ ] MongoDB TTL index on Status (auto-delete after 24h)
- [ ] Proper indexes on all frequently queried fields
- [ ] Error handler catches all async errors via asyncHandler wrapper
- [ ] CORS only allows whitelisted origins
- [ ] File upload validates type + size server-side
- [ ] Brute force protection on login (lockout after 5 fails)
- [ ] Refresh token rotation on every refresh
- [ ] httpOnly + Secure + SameSite cookies for refresh token

### Frontend
- [ ] Optimistic UI: messages appear instantly, confirmed by server
- [ ] Reconnection logic in socket client (auto-reconnect, backoff)
- [ ] Draft messages saved per chat
- [ ] Unread count badges on chat list
- [ ] ✓ (sent) ✓✓ (delivered) ✓✓ blue (read) tick states
- [ ] Typing indicator dots animation
- [ ] Online ring on avatar when user is online
- [ ] Image lightbox with pinch-to-zoom (mobile)
- [ ] Pull-to-refresh on chat list
- [ ] Infinite scroll (load older messages) on scroll to top
- [ ] Dark mode as default, light mode toggle
- [ ] Fully responsive: mobile single-panel, desktop two-panel
- [ ] Link preview auto-generation in input
- [ ] Emoji picker (emoji-mart full set)
- [ ] Voice recorder with visual waveform

### Demo-ready
- [ ] Seed data loaded (admin + 10 users + sample chats)
- [ ] Both panels work in same browser (use incognito for second user)
- [ ] Real-time messaging visible between two tabs
- [ ] Admin can see stats, ban user, send broadcast
- [ ] Status stories work end-to-end
- [ ] Voice/video call connects (WebRTC)
- [ ] Media upload works (image + document)
- [ ] Deployed URLs work on mobile browsers

---

## 🎬 SECTION 14 — COLLEGE DEMO SCRIPT

Present in this order for maximum impact (20 minutes):

1. **Auth Flow** (2 min) — Register → OTP email → Login → See chats
2. **Real-time Chat** (4 min) — Two tabs: text, emoji, image, voice note, reactions, read receipts
3. **Group Chat** (2 min) — Create group, add members, send poll, see results
4. **Status Stories** (2 min) — Create text status, view from other account, react
5. **Media & Calls** (3 min) — Send image, video, document; initiate voice call (show ringing)
6. **Privacy & Settings** (1 min) — Dark/light mode, privacy settings, profile
7. **Admin Panel** (6 min):
   - Dashboard: live stats + charts
   - Ban a user → show them logged out
   - Send admin broadcast → all users receive it
   - Analytics: message volume charts
   - Show automation rules

---

## 📦 SECTION 15 — FREE SERVICES USED

| Service | What For | Free Tier |
|---------|----------|-----------|
| MongoDB Atlas | Database | 512MB (plenty for demo) |
| Cloudinary | Media storage/CDN | 25GB bandwidth, 10GB storage |
| Render.com | Backend hosting | 750 hrs/month, sleeps after 15min idle |
| Vercel | Frontend hosting | Unlimited, custom domain |
| Gmail SMTP | OTP emails | 500 emails/day free |

**Note on Render free tier:** Add a cron job (e.g., cron-job.org) to ping `/api/health` every 10 minutes to prevent the server sleeping during the demo.

---

*Built with: React 18 + Vite + TailwindCSS + Zustand + Socket.io Client + Axios*
*Backend: Node.js + Express + Socket.io + MongoDB + Mongoose + Cloudinary*
*Auth: JWT (access 15m) + Refresh Token (7d httpOnly cookie) + bcrypt + OTP*
*Calls: WebRTC via simple-peer, signaling via Socket.io*
*Deploy: Vercel (frontend) + Render (backend) + MongoDB Atlas + Cloudinary*
