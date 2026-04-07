import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['private', 'group', 'broadcast', 'community'], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: { type: Map, of: Number, default: {} },
  isPinned: { type: Map, of: Boolean, default: {} },
  isArchived: { type: Map, of: Boolean, default: {} },
  isMuted: { type: Map, of: Date, default: {} },
  chatLock: { type: Map, of: Boolean, default: {} },
  disappearingMessages: { type: String, enum: ['off', '24h', '7d', '90d'], default: 'off' },
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

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
