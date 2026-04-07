import mongoose from 'mongoose';

const quickReplySchema = new mongoose.Schema({
  shortcut: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  media: { url: String, publicId: String, type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

const QuickReply = mongoose.model('QuickReply', quickReplySchema);
export default QuickReply;
