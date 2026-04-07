import User from '../models/User.model.js';
import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import Call from '../models/Call.model.js';
import Label from '../models/Label.model.js';
import QuickReply from '../models/QuickReply.model.js';
import Catalog from '../models/Catalog.model.js';
import Admin from '../models/Admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Dashboard Stats ───
export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [totalUsers, activeNow, newToday, messagesToday, totalGroups, totalCalls] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isOnline: true }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    Message.countDocuments({ createdAt: { $gte: todayStart } }),
    Chat.countDocuments({ type: 'group' }),
    Call.countDocuments()
  ]);
  res.json({ success: true, data: { totalUsers, activeNow, newToday, messagesToday, totalGroups, totalCalls } });
});

// ─── User Management ───
export const getAllUsers = asyncHandler(async (req, res) => {
  const { q, role, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const query = {};
  if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  if (role) query.role = role;
  if (status === 'active') query.isBanned = false;
  if (status === 'banned') query.isBanned = true;

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort(sort).skip((page - 1) * limit).limit(parseInt(limit))
    .select('name email avatar role isOnline lastSeen createdAt isBanned isVerified');
  res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const msgCount = await Message.countDocuments({ sender: req.params.id });
  const groupCount = await Chat.countDocuments({ type: 'group', participants: req.params.id });
  res.json({ success: true, data: { ...user.toObject(), stats: { msgCount, groupCount } } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: user });
});

export const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: reason });
  res.json({ success: true, message: 'User banned' });
});

export const unbanUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: null });
  res.json({ success: true, message: 'User unbanned' });
});

export const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ success: true, message: 'Role updated' });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

// ─── Analytics ───
export const getAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [userGrowth, messagesByDay, messageTypes] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Message.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Message.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  ]);

  res.json({ success: true, data: { userGrowth, messagesByDay, messageTypes } });
});

// ─── Chat Monitor ───
export const getAdminChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find().populate('participants', 'name avatar').populate('lastMessage').sort({ updatedAt: -1 }).limit(50);
  res.json({ success: true, data: chats });
});

export const getAdminMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.query;
  const query = chatId ? { chat: chatId } : {};
  const messages = await Message.find(query).populate('sender', 'name avatar').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: messages });
});

// ─── Labels ───
export const getLabels = asyncHandler(async (req, res) => {
  const labels = await Label.find({ createdBy: req.user._id });
  res.json({ success: true, data: labels });
});

export const createLabel = asyncHandler(async (req, res) => {
  const label = await Label.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: label });
});

export const updateLabel = asyncHandler(async (req, res) => {
  const label = await Label.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: label });
});

export const deleteLabel = asyncHandler(async (req, res) => {
  await Label.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Label deleted' });
});

// ─── Quick Replies ───
export const getQuickReplies = asyncHandler(async (req, res) => {
  const replies = await QuickReply.find({ createdBy: req.user._id });
  res.json({ success: true, data: replies });
});

export const createQuickReply = asyncHandler(async (req, res) => {
  const reply = await QuickReply.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: reply });
});

export const updateQuickReply = asyncHandler(async (req, res) => {
  const reply = await QuickReply.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: reply });
});

export const deleteQuickReply = asyncHandler(async (req, res) => {
  await QuickReply.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Quick reply deleted' });
});

// ─── Catalog ───
export const getCatalog = asyncHandler(async (req, res) => {
  const items = await Catalog.find({ createdBy: req.user._id });
  res.json({ success: true, data: items });
});

export const createCatalogItem = asyncHandler(async (req, res) => {
  const item = await Catalog.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: item });
});

export const updateCatalogItem = asyncHandler(async (req, res) => {
  const item = await Catalog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: item });
});

export const deleteCatalogItem = asyncHandler(async (req, res) => {
  await Catalog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Item deleted' });
});

// ─── Automations ───
export const getAutomations = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id });
  res.json({ success: true, data: admin?.automationRules || [] });
});

export const createAutomation = asyncHandler(async (req, res) => {
  let admin = await Admin.findOne({ user: req.user._id });
  if (!admin) admin = await Admin.create({ user: req.user._id });
  admin.automationRules.push(req.body);
  await admin.save();
  res.status(201).json({ success: true, data: admin.automationRules });
});

export const updateAutomation = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id });
  const rule = admin.automationRules.id(req.params.ruleId);
  if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
  Object.assign(rule, req.body);
  await admin.save();
  res.json({ success: true, data: rule });
});

export const deleteAutomation = asyncHandler(async (req, res) => {
  await Admin.findOneAndUpdate({ user: req.user._id }, { $pull: { automationRules: { _id: req.params.ruleId } } });
  res.json({ success: true, message: 'Rule deleted' });
});

// ─── Agents ───
export const getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: 'agent' }).select('name email avatar isOnline lastSeen createdAt');
  res.json({ success: true, data: agents });
});

export const createAgent = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.body.userId, { role: 'agent' });
  res.json({ success: true, message: 'Agent created' });
});

export const deleteAgent = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: 'user' });
  res.json({ success: true, message: 'Agent removed' });
});
