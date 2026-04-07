import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';
import Status from '../models/Status.model.js';
import Call from '../models/Call.model.js';
import logger from '../utils/logger.js';

const userSocketMap = new Map(); // userId -> Set<socketId>
const callRooms = new Map();     // roomId -> { initiator, receiver, type }
const chatSequences = new Map(); // chatId -> lastSequenceNumber

const getNextSequence = async (chatId) => {
  if (!chatSequences.has(chatId)) {
    const lastMsg = await Message.findOne({ chat: chatId }).sort({ sequenceNumber: -1 }).select('sequenceNumber').lean();
    chatSequences.set(chatId, lastMsg?.sequenceNumber || 0);
  }
  const next = chatSequences.get(chatId) + 1;
  chatSequences.set(chatId, next);
  return next;
};

export const initializeSocket = (io) => {

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: ${userId} (${socket.id})`);

    // Track multi-device sockets
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);

    // Mark online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
    socket.broadcast.emit('user:online', { userId });

    // Auto-join all user chats
    const chats = await Chat.find({ participants: userId }).select('_id');
    chats.forEach(chat => socket.join(`chat:${chat._id}`));

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // ─────────────────────────────────────────
    // MESSAGING
    // ─────────────────────────────────────────
    socket.on('message:send', async (data) => {
      const { chatId, tempId, clientId, content, type, media, replyTo, isViewOnce, disappearAt, mentionedUsers, poll, contact, location, linkPreview } = data;
      try {
        // Duplicate prevention via clientId
        if (clientId) {
          const existing = await Message.findOne({ clientId }).lean();
          if (existing) {
            socket.emit('message:sent', { tempId, messageId: existing._id });
            return;
          }
        }

        const sequenceNumber = await getNextSequence(chatId);

        const messageData = {
          chat: chatId, sender: userId, type: type || 'text',
          content, media, replyTo, isViewOnce, disappearAt, mentionedUsers,
          sequenceNumber
        };
        if (clientId) messageData.clientId = clientId;
        if (poll) messageData.poll = poll;
        if (contact) messageData.contact = contact;
        if (location) messageData.location = location;
        if (linkPreview) messageData.linkPreview = linkPreview;

        const message = await Message.create(messageData);
        await message.populate([
          { path: 'sender', select: 'name avatar' },
          { path: 'replyTo', populate: { path: 'sender', select: 'name' } }
        ]);
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        // Deliver to room
        socket.to(`chat:${chatId}`).emit('message:receive', message);
        socket.emit('message:sent', { tempId, messageId: message._id });

        // Increment unread for others
        const chat = await Chat.findById(chatId).select('participants');
        const updateOps = {};
        chat.participants.forEach(pid => {
          if (pid.toString() !== userId) {
            updateOps[`unreadCount.${pid}`] = 1;
          }
        });
        if (Object.keys(updateOps).length) {
          await Chat.findByIdAndUpdate(chatId, { $inc: updateOps });
        }
      } catch (err) {
        socket.emit('message:error', { tempId, error: err.message });
      }
    });

    socket.on('message:delivered', async ({ messageId, chatId }) => {
      await Message.findByIdAndUpdate(messageId, {
        [`status.${userId}.delivered`]: new Date()
      });
      socket.to(`chat:${chatId}`).emit('message:status', { messageId, userId, status: 'delivered' });
    });

    socket.on('message:read', async ({ chatId }) => {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId }, [`status.${userId}.read`]: { $exists: false } },
        { $set: { [`status.${userId}.read`]: new Date() } }
      );
      await Chat.findByIdAndUpdate(chatId, { [`unreadCount.${userId}`]: 0 });
      socket.to(`chat:${chatId}`).emit('message:read', { chatId, userId });
    });

    socket.on('message:react', async ({ messageId, chatId, emoji }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      const idx = message.reactions.findIndex(r => r.user.toString() === userId);
      if (idx !== -1) {
        if (message.reactions[idx].emoji === emoji) message.reactions.splice(idx, 1);
        else message.reactions[idx].emoji = emoji;
      } else {
        message.reactions.push({ user: userId, emoji });
      }
      await message.save();
      io.to(`chat:${chatId}`).emit('message:reacted', { messageId, reactions: message.reactions });
    });

    socket.on('message:edit', async ({ messageId, chatId, content }) => {
      const now = new Date();
      const msg = await Message.findById(messageId);
      if (!msg || msg.sender.toString() !== userId) return;
      const minutesOld = (now - msg.createdAt) / 1000 / 60;
      if (minutesOld > 15) return socket.emit('message:error', { error: 'Edit window expired' });
      await Message.findByIdAndUpdate(messageId, { content, isEdited: true, editedAt: now });
      io.to(`chat:${chatId}`).emit('message:edited', { messageId, content, editedAt: now });
    });

    socket.on('message:delete', async ({ messageId, chatId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        await Message.findOneAndUpdate(
          { _id: messageId, sender: userId },
          { isDeletedForEveryone: true, content: 'This message was deleted', media: null, type: 'system' }
        );
        io.to(`chat:${chatId}`).emit('message:deleted', { messageId, deleteForEveryone: true });
      } else {
        await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedFor: userId } });
        socket.emit('message:deleted', { messageId, deleteForEveryone: false });
      }
    });

    socket.on('message:forward', async ({ messageId, targetChatIds }) => {
      const original = await Message.findById(messageId);
      if (!original) return;
      for (const chatId of targetChatIds) {
        const forwarded = await Message.create({
          chat: chatId, sender: userId, type: original.type,
          content: original.content, media: original.media,
          isForwarded: true, forwardedFrom: original.chat
        });
        await forwarded.populate('sender', 'name avatar');
        await Chat.findByIdAndUpdate(chatId, { lastMessage: forwarded._id, updatedAt: new Date() });
        io.to(`chat:${chatId}`).emit('message:receive', forwarded);
      }
    });

    socket.on('message:star', async ({ messageId, star }) => {
      if (star) {
        await User.findByIdAndUpdate(userId, { $addToSet: { starredMessages: messageId } });
        await Message.findByIdAndUpdate(messageId, { $addToSet: { isStarred: userId } });
      } else {
        await User.findByIdAndUpdate(userId, { $pull: { starredMessages: messageId } });
        await Message.findByIdAndUpdate(messageId, { $pull: { isStarred: userId } });
      }
      socket.emit('message:starred', { messageId, star });
    });

    // ─────────────────────────────────────────
    // POLL VOTING
    // ─────────────────────────────────────────
    socket.on('message:poll-vote', async ({ messageId, chatId, optionIndex }) => {
      const message = await Message.findById(messageId);
      if (!message || message.type !== 'poll' || !message.poll) return;
      // Remove previous votes by this user
      message.poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(v => v.toString() !== userId);
      });
      // Add vote to selected option
      if (optionIndex >= 0 && optionIndex < message.poll.options.length) {
        message.poll.options[optionIndex].votes.push(userId);
      }
      await message.save();
      io.to(`chat:${chatId}`).emit('message:poll-voted', {
        messageId,
        poll: message.poll
      });
    });

    // ─────────────────────────────────────────
    // TYPING & RECORDING
    // ─────────────────────────────────────────
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', { chatId, userId });
    });
    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { chatId, userId });
    });
    socket.on('recording:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('recording:start', { chatId, userId });
    });
    socket.on('recording:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('recording:stop', { chatId, userId });
    });

    // ─────────────────────────────────────────
    // WEBRTC CALLS
    // ─────────────────────────────────────────
    socket.on('call:initiate', async ({ targetUserId, chatId, callType }) => {
      const targetSockets = userSocketMap.get(targetUserId);
      if (!targetSockets?.size) return socket.emit('call:unavailable', { targetUserId });
      const roomId = `call:${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      callRooms.set(roomId, { initiator: userId, receiver: targetUserId, chatId, callType, startedAt: null });
      socket.join(roomId);
      const caller = await User.findById(userId).select('name avatar');
      targetSockets.forEach(sid => {
        io.to(sid).emit('call:incoming', { callerId: userId, callerInfo: caller, chatId, callType, roomId });
      });
      socket.emit('call:ringing', { roomId, targetUserId });
      await Call.create({ initiator: userId, participants: [userId, targetUserId], chat: chatId, type: callType, roomId });
    });

    socket.on('call:accept', ({ roomId }) => {
      const room = callRooms.get(roomId);
      if (!room) return;
      room.startedAt = new Date();
      socket.join(roomId);
      io.to(roomId).emit('call:accepted', { roomId, acceptedBy: userId });
      Call.findOneAndUpdate({ roomId }, { status: 'ongoing', startedAt: new Date() }).exec();
    });

    socket.on('call:reject', async ({ roomId }) => {
      const room = callRooms.get(roomId);
      if (!room) return;
      io.to(roomId).emit('call:rejected', { roomId });
      callRooms.delete(roomId);
      await Call.findOneAndUpdate({ roomId }, { status: 'rejected', endedAt: new Date() });
    });

    socket.on('call:end', async ({ roomId }) => {
      const room = callRooms.get(roomId);
      io.to(roomId).emit('call:ended', { roomId });
      if (room?.startedAt) {
        const duration = Math.floor((new Date() - room.startedAt) / 1000);
        await Call.findOneAndUpdate({ roomId }, { status: 'ended', endedAt: new Date(), duration });
      }
      callRooms.delete(roomId);
    });

    socket.on('call:missed', async ({ roomId }) => {
      await Call.findOneAndUpdate({ roomId }, { status: 'missed', endedAt: new Date() });
      io.to(roomId).emit('call:missed', { roomId });
      callRooms.delete(roomId);
    });

    // WebRTC signaling
    socket.on('webrtc:ready', ({ roomId }) => socket.to(roomId).emit('webrtc:ready', { from: userId }));
    socket.on('webrtc:offer', ({ roomId, offer }) => socket.to(roomId).emit('webrtc:offer', { offer, from: userId }));
    socket.on('webrtc:answer', ({ roomId, answer }) => socket.to(roomId).emit('webrtc:answer', { answer, from: userId }));
    socket.on('webrtc:ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('webrtc:ice-candidate', { candidate, from: userId }));

    // ─────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────
    socket.on('status:view', async ({ statusId, ownerId }) => {
      await Status.findByIdAndUpdate(statusId, {
        $addToSet: { viewers: { user: userId, viewedAt: new Date() } }
      });
      const ownerSockets = userSocketMap.get(ownerId);
      ownerSockets?.forEach(sid => io.to(sid).emit('status:viewed', { statusId, viewerId: userId }));
    });

    socket.on('status:react', async ({ statusId, ownerId, reaction }) => {
      await Status.findOneAndUpdate(
        { _id: statusId, 'viewers.user': userId },
        { $set: { 'viewers.$.reaction': reaction } }
      );
      const ownerSockets = userSocketMap.get(ownerId);
      ownerSockets?.forEach(sid => io.to(sid).emit('status:reaction', { statusId, from: userId, reaction }));
    });

    // ─────────────────────────────────────────
    // LIVE LOCATION
    // ─────────────────────────────────────────
    socket.on('location:live', ({ chatId, lat, lng, accuracy }) => {
      socket.to(`chat:${chatId}`).emit('location:live-update', { userId, lat, lng, accuracy, timestamp: new Date() });
    });

    // ─────────────────────────────────────────
    // GROUPS
    // ─────────────────────────────────────────
    socket.on('group:join', ({ groupId }) => socket.join(`chat:${groupId}`));
    socket.on('group:leave', ({ groupId }) => socket.leave(`chat:${groupId}`));
    socket.on('group:admin-action', ({ groupId, action, targetUserId }) => {
      io.to(`chat:${groupId}`).emit('group:updated', { action, targetUserId, by: userId });
    });

    // ─────────────────────────────────────────
    // RECONNECT CATCH-UP
    // ─────────────────────────────────────────
    socket.on('sync:catchup', async ({ lastTimestamp }) => {
      try {
        const since = new Date(lastTimestamp || Date.now() - 30 * 60 * 1000); // default: last 30 min
        const userChats = await Chat.find({ participants: userId }).select('_id');
        const chatIds = userChats.map(c => c._id);

        const missedMessages = await Message.find({
          chat: { $in: chatIds },
          createdAt: { $gt: since },
          sender: { $ne: userId }
        })
          .populate('sender', 'name avatar')
          .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        if (missedMessages.length > 0) {
          socket.emit('sync:catchup-response', { messages: missedMessages });
        }
      } catch (err) {
        logger.error(`Catchup failed for ${userId}: ${err.message}`);
      }
    });

    // ─────────────────────────────────────────
    // PRESENCE & DISCONNECT
    // ─────────────────────────────────────────
    socket.on('disconnect', async () => {
      const sockets = userSocketMap.get(userId);
      sockets?.delete(socket.id);
      if (!sockets?.size) {
        userSocketMap.delete(userId);
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
        socket.broadcast.emit('user:offline', { userId, lastSeen });
      }
      logger.info(`Socket disconnected: ${userId} (${socket.id})`);
    });
  });
};

export const emitToUser = (io, userId, event, data) => {
  const sockets = userSocketMap.get(userId?.toString());
  sockets?.forEach(sid => io.to(sid).emit(event, data));
};
