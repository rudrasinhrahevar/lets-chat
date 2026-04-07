import Call from '../models/Call.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCallHistory = asyncHandler(async (req, res) => {
  const calls = await Call.find({
    $or: [{ initiator: req.user._id }, { participants: req.user._id }]
  })
    .populate('initiator', 'name avatar')
    .populate('participants', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: calls });
});

export const logCall = asyncHandler(async (req, res) => {
  const { targetUserId, chatId, type, status, duration } = req.body;
  const call = await Call.create({
    initiator: req.user._id,
    participants: [req.user._id, targetUserId],
    chat: chatId,
    type,
    status: status || 'ended',
    duration,
    startedAt: new Date(Date.now() - (duration || 0) * 1000),
    endedAt: new Date()
  });
  res.status(201).json({ success: true, data: call });
});
