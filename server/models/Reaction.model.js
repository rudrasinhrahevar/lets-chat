import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true }
}, { timestamps: true });

reactionSchema.index({ message: 1, user: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);
export default Reaction;
