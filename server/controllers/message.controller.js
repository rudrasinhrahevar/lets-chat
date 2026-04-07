import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { cursor, limit = 50 } = req.query;
  const query = { chat: chatId, deletedFor: { $ne: req.user._id } };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('sender', 'name avatar')
    .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } })
    .lean();

  const hasMore = messages.length === parseInt(limit);
  res.json({
    success: true,
    data: messages.reverse(),
    pagination: { hasMore, nextCursor: messages.length ? messages[0].createdAt : null }
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, type, media, replyTo, isViewOnce, disappearAt, mentionedUsers } = req.body;
  const message = await Message.create({
    chat: chatId, sender: req.user._id, type: type || 'text',
    content, media, replyTo, isViewOnce, disappearAt, mentionedUsers
  });
  await message.populate([
    { path: 'sender', select: 'name avatar' },
    { path: 'replyTo', populate: { path: 'sender', select: 'name' } }
  ]);
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });

  if (global.io) {
    global.io.to(`chat:${chatId}`).emit('message:receive', message);
  }

  res.status(201).json({ success: true, data: message });
});

export const editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
  if (msg.sender.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your message' });
  const minutesOld = (new Date() - msg.createdAt) / 1000 / 60;
  if (minutesOld > 15) return res.status(400).json({ success: false, message: 'Edit window expired' });

  msg.content = content;
  msg.isEdited = true;
  msg.editedAt = new Date();
  await msg.save();

  if (global.io) {
    global.io.to(`chat:${msg.chat}`).emit('message:edited', { messageId: msg._id, content, editedAt: msg.editedAt });
  }

  res.json({ success: true, data: msg });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { deleteForEveryone } = req.body;
  if (deleteForEveryone) {
    await Message.findOneAndUpdate(
      { _id: req.params.id, sender: req.user._id },
      { isDeletedForEveryone: true, content: 'This message was deleted', media: null, type: 'system' }
    );
    if (global.io) {
      const msg = await Message.findById(req.params.id);
      global.io.to(`chat:${msg.chat}`).emit('message:deleted', { messageId: req.params.id, deleteForEveryone: true });
    }
  } else {
    await Message.findByIdAndUpdate(req.params.id, { $addToSet: { deletedFor: req.user._id } });
  }
  res.json({ success: true, message: 'Message deleted' });
});

export const forwardMessage = asyncHandler(async (req, res) => {
  const { targetChatIds } = req.body;
  const original = await Message.findById(req.params.id);
  if (!original) return res.status(404).json({ success: false, message: 'Message not found' });

  const forwarded = [];
  for (const chatId of targetChatIds) {
    const msg = await Message.create({
      chat: chatId, sender: req.user._id, type: original.type,
      content: original.content, media: original.media,
      isForwarded: true, forwardedFrom: original.chat
    });
    await msg.populate('sender', 'name avatar');
    await Chat.findByIdAndUpdate(chatId, { lastMessage: msg._id, updatedAt: new Date() });
    if (global.io) global.io.to(`chat:${chatId}`).emit('message:receive', msg);
    forwarded.push(msg);
  }
  res.json({ success: true, data: forwarded });
});

export const starMessage = asyncHandler(async (req, res) => {
  const { star } = req.body;
  if (star) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { starredMessages: req.params.id } });
    await Message.findByIdAndUpdate(req.params.id, { $addToSet: { isStarred: req.user._id } });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $pull: { starredMessages: req.params.id } });
    await Message.findByIdAndUpdate(req.params.id, { $pull: { isStarred: req.user._id } });
  }
  res.json({ success: true, message: star ? 'Message starred' : 'Message unstarred' });
});

export const searchMessages = asyncHandler(async (req, res) => {
  const { q, chatId } = req.query;
  if (!q) return res.json({ success: true, data: [] });
  const query = { $text: { $search: q }, deletedFor: { $ne: req.user._id } };
  if (chatId) query.chat = chatId;
  const messages = await Message.find(query)
    .populate('sender', 'name avatar')
    .populate('chat', 'type participants')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: messages });
});

export const getStarredMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ isStarred: req.user._id })
    .populate('sender', 'name avatar')
    .populate('chat', 'type participants')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: messages });
});

export const getChatMedia = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    chat: req.params.chatId,
    type: { $in: ['image', 'video', 'audio', 'document'] },
    deletedFor: { $ne: req.user._id }
  }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: messages });
});
