import mongoose from 'mongoose';

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

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;
