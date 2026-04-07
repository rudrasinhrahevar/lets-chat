import mongoose from "mongoose";

const ChatMessageSchema = mongoose.Schema(
  {
    chatRoomId: String,
    sender: String,
    message: {
      type: String,
      default: ''
    },
    attachment: {
      url: String,
      fileType: String, // 'image', 'video', 'audio', 'document', 'pdf'
      name: String,
      size: Number,
      publicId: String
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [{
      type: String
    }]
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
