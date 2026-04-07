import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  type: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['ringing', 'ongoing', 'ended', 'missed', 'rejected'], default: 'ringing' },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  roomId: String
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);
export default Call;
