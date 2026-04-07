import mongoose from 'mongoose';

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
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ name: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
