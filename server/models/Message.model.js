import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'voice', 'document', 'contact', 'location', 'sticker', 'gif', 'poll', 'system'],
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
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  isForwarded: { type: Boolean, default: false },
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  status: { type: Map, of: { delivered: Date, read: Date } },
  clientId: { type: String, unique: true, sparse: true },
  sequenceNumber: { type: Number },
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
messageSchema.index({ clientId: 1 }, { unique: true, sparse: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
