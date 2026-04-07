import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  thumbnail: String,
  filename: String,
  filesize: Number,
  mimeType: String,
  width: Number,
  height: Number,
  duration: Number
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);
export default Media;
