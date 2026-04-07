import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, about, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (about !== undefined) updates.about = about;
  if (phone) updates.phone = phone;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, data: user });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, { folder: 'avatars', width: 300, height: 300, crop: 'fill' });
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
  res.json({ success: true, data: { avatar: user.avatar } });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: [] });
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } },
      { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }, { phone: { $regex: q, $options: 'i' } }] }
    ]
  }).select('name email avatar about isOnline lastSeen').limit(20);
  res.json({ success: true, data: users });
});

export const getContacts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('contacts', 'name email avatar about isOnline lastSeen');
  res.json({ success: true, data: user.contacts || [] });
});

export const addContact = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email configuration is required' });
  
  const targetUser = await User.findOne({ email: email.toLowerCase() });
  if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
  if (targetUser._id.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'You cannot map yourself as a contact' });

  const currentUser = await User.findById(req.user._id);
  if (currentUser.contacts?.includes(targetUser._id)) {
    return res.status(400).json({ success: false, message: 'User is already saved in your contacts' });
  }

  currentUser.contacts.push(targetUser._id);
  await currentUser.save();

  const hydratedContact = await User.findById(targetUser._id).select('name email avatar about isOnline lastSeen');
  res.json({ success: true, data: hydratedContact });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name email avatar about isOnline lastSeen privacy');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

export const updatePrivacy = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { privacy: req.body }, { new: true });
  res.json({ success: true, data: user.privacy });
});

export const updateNotifications = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { notifications: req.body }, { new: true });
  res.json({ success: true, data: user.notifications });
});

export const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { theme }, { new: true });
  res.json({ success: true, data: { theme: user.theme } });
});

export const blockUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: req.params.id } });
  res.json({ success: true, message: 'User blocked' });
});

export const unblockUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: req.params.id } });
  res.json({ success: true, message: 'User unblocked' });
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('blockedUsers', 'name avatar');
  res.json({ success: true, data: user.blockedUsers });
});

export const getStarredMessages = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'starredMessages',
    populate: [{ path: 'sender', select: 'name avatar' }, { path: 'chat', select: 'type participants' }]
  });
  res.json({ success: true, data: user.starredMessages });
});

export const getLinkedDevices = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('linkedDevices');
  res.json({ success: true, data: user.linkedDevices });
});

export const removeLinkedDevice = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { linkedDevices: { _id: req.params.id } } });
  res.json({ success: true, message: 'Device removed' });
});
