import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#00a884' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Label = mongoose.model('Label', labelSchema);
export default Label;
