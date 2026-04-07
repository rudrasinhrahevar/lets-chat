import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name avatar isOnline lastSeen about')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  const populated = await Chat.populate(chats, { path: 'lastMessage.sender', select: 'name', model: 'User' });
  res.json({ success: true, data: populated });
});

export const createPrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

  let chat = await Chat.findOne({
    type: 'private',
    participants: { $all: [req.user._id, userId], $size: 2 }
  }).populate('participants', 'name avatar isOnline lastSeen about');

  if (chat) return res.json({ success: true, data: chat });

  chat = await Chat.create({ type: 'private', participants: [req.user._id, userId] });
  chat = await chat.populate('participants', 'name avatar isOnline lastSeen about');

  // Notify via socket
  if (global.io) {
    global.io.to(`user:${userId}`).emit('chat:new', chat);
  }

  res.status(201).json({ success: true, data: chat });
});

export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name avatar isOnline lastSeen about')
    .populate({ path: 'groupInfo.admins', select: 'name avatar' })
    .populate({ path: 'groupInfo.superAdmin', select: 'name avatar' });
  if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
  res.json({ success: true, data: chat });
});

export const clearChat = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { chat: req.params.id },
    { $addToSet: { deletedFor: req.user._id } }
  );
  res.json({ success: true, message: 'Chat cleared' });
});

export const pinChat = asyncHandler(async (req, res) => {
  const { pinned } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { [`isPinned.${req.user._id}`]: pinned });
  res.json({ success: true, message: pinned ? 'Chat pinned' : 'Chat unpinned' });
});

export const archiveChat = asyncHandler(async (req, res) => {
  const { archived } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { [`isArchived.${req.user._id}`]: archived });
  res.json({ success: true, message: archived ? 'Chat archived' : 'Chat unarchived' });
});

export const muteChat = asyncHandler(async (req, res) => {
  const { mutedUntil } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { [`isMuted.${req.user._id}`]: mutedUntil ? new Date(mutedUntil) : null });
  res.json({ success: true, message: 'Chat mute updated' });
});

export const setDisappearing = asyncHandler(async (req, res) => {
  const { duration } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { disappearingMessages: duration });
  res.json({ success: true, message: 'Disappearing messages updated' });
});

export const setChatWallpaper = asyncHandler(async (req, res) => {
  const { wallpaper } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { [`wallpaper.${req.user._id}`]: wallpaper });
  res.json({ success: true, message: 'Wallpaper updated' });
});

export const lockChat = asyncHandler(async (req, res) => {
  const { locked } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { [`chatLock.${req.user._id}`]: locked });
  res.json({ success: true, message: locked ? 'Chat locked' : 'Chat unlocked' });
});
