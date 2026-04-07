import Broadcast from '../models/Broadcast.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBroadcast = asyncHandler(async (req, res) => {
  const { name, recipients } = req.body;
  const broadcast = await Broadcast.create({ name, recipients, createdBy: req.user._id });
  res.status(201).json({ success: true, data: broadcast });
});

export const getBroadcasts = asyncHandler(async (req, res) => {
  const broadcasts = await Broadcast.find({ createdBy: req.user._id }).populate('recipients', 'name avatar').sort({ updatedAt: -1 });
  res.json({ success: true, data: broadcasts });
});

export const deleteBroadcast = asyncHandler(async (req, res) => {
  await Broadcast.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Broadcast deleted' });
});

export const sendBroadcastMessage = asyncHandler(async (req, res) => {
  const { content, type, media } = req.body;
  const broadcast = await Broadcast.findById(req.params.id).populate('recipients', 'name');
  if (!broadcast) return res.status(404).json({ success: false, message: 'Broadcast not found' });

  broadcast.messages.push({ content, type: type || 'text', media, sentAt: new Date() });
  await broadcast.save();

  // Send to all recipients via socket
  if (global.io) {
    broadcast.recipients.forEach(recipient => {
      global.io.to(`user:${recipient._id}`).emit('broadcast:message', {
        broadcastId: broadcast._id,
        broadcastName: broadcast.name,
        content,
        from: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
      });
    });
  }

  res.json({ success: true, message: 'Broadcast sent', data: broadcast });
});

export const getBroadcastStats = asyncHandler(async (req, res) => {
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) return res.status(404).json({ success: false, message: 'Broadcast not found' });
  const stats = broadcast.messages.map(msg => ({
    sentAt: msg.sentAt, content: msg.content,
    delivered: msg.deliveredTo?.length || 0,
    read: msg.readBy?.length || 0,
    total: broadcast.recipients.length
  }));
  res.json({ success: true, data: stats });
});
