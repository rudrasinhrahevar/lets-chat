import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";

const app = express();

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnucxmp2s',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('✅ Cloudinary configured with cloud_name: dnucxmp2s');

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "https://lets-chat-delta.vercel.app"
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Generate signed URL for Cloudinary raw files
app.get("/api/download/:publicId(*)", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    console.log(`📥 Generating signed URL for publicId: ${publicId}`);
    
    // Generate a signed URL that expires in 1 hour
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true
    });
    
    console.log(`✅ Generated signed URL: ${signedUrl}`);
    
    // Redirect to the signed URL
    res.redirect(signedUrl);
  } catch (error) {
    console.error('❌ Download proxy error:', error.message);
    console.error('❌ Error details:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to download file', details: error.message });
  }
});

app.use(VerifyToken);

const PORT = process.env.PORT || 3001;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://lets-chat-delta.vercel.app"
    ].filter(Boolean),
    credentials: true,
  },
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();
global.io = io; // Make io available globally

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message, messageId, attachment, replyTo, chatRoomId }) => {
    const sendUserSocket = onlineUsers.get(receiverId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("getMessage", {
        senderId,
        message,
        messageId,
        attachment,
        replyTo,
        chatRoomId,
      });
      // Mark as delivered if receiver is online
      socket.to(sendUserSocket).emit("messageDelivered", {
        messageId,
      });
      // Notify sender that message was delivered
      socket.emit("messageDelivered", {
        messageId,
      });
    }
  });

  socket.on("markAsRead", ({ chatRoomId, userId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      socket.to(receiverSocket).emit("messagesRead", {
        chatRoomId,
        userId,
      });
    }
  });

  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      socket.to(receiverSocket).emit("userTyping", {
        senderId,
        receiverId,
        isTyping,
      });
    }
  });

  // Video/Voice Call Signaling
  socket.on("callUser", ({ userToCall, signalData, from, name, isVoiceOnly }) => {
    const receiverSocket = onlineUsers.get(userToCall);
    if (receiverSocket) {
      io.to(receiverSocket).emit("callUser", {
        signal: signalData,
        from,
        name,
        isVoiceOnly: !!isVoiceOnly,
      });
    }
  });

  socket.on("answerCall", (data) => {
    const callerSocket = onlineUsers.get(data.to);
    if (callerSocket) {
      io.to(callerSocket).emit("callAccepted", data.signal);
    }
  });

  socket.on("endCall", ({ id }) => {
    const otherUserSocket = onlineUsers.get(id);
    if (otherUserSocket) {
      io.to(otherUserSocket).emit("callEnded");
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    socket.emit("getUsers", Array.from(onlineUsers));
  });
});
