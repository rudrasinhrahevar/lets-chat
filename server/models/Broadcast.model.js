import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    content: String,
    type: { type: String, default: 'text' },
    media: { url: String, publicId: String },
    sentAt: { type: Date, default: Date.now },
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Broadcast = mongoose.model('Broadcast', broadcastSchema);
export default Broadcast;
