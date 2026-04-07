import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'video', 'voice'], required: true },
  content: String,
  media: { url: String, publicId: String, thumbnail: String, duration: Number, mimeType: String },
  background: String,
  font: String,
  viewers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now },
    reaction: String
  }],
  privacy: { type: String, enum: ['everyone', 'contacts', 'selected', 'except'], default: 'everyone' },
  hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), index: { expireAfterSeconds: 0 } }
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);
export default Status;
