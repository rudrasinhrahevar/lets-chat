import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import Poll from '../models/Poll.model.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Group name required' });
  const participants = [...new Set([req.user._id.toString(), ...(members || [])])];
  const inviteLink = crypto.randomBytes(8).toString('hex');

  const chat = await Chat.create({
    type: 'group',
    participants,
    groupInfo: {
      name, description,
      admins: [req.user._id],
      superAdmin: req.user._id,
      inviteLink
    }
  });

  const systemMsg = await Message.create({
    chat: chat._id, sender: req.user._id, type: 'system',
    content: `${req.user.name} created group "${name}"`
  });
  await Chat.findByIdAndUpdate(chat._id, { lastMessage: systemMsg._id });

  const populated = await Chat.findById(chat._id).populate('participants', 'name avatar isOnline lastSeen');
  res.status(201).json({ success: true, data: populated });
});

export const getGroup = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'name avatar isOnline lastSeen about')
    .populate('groupInfo.admins', 'name avatar')
    .populate('groupInfo.superAdmin', 'name avatar');
  if (!chat || chat.type !== 'group') return res.status(404).json({ success: false, message: 'Group not found' });
  res.json({ success: true, data: chat });
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { name, description, avatar } = req.body;
  const updates = {};
  if (name) updates['groupInfo.name'] = name;
  if (description !== undefined) updates['groupInfo.description'] = description;
  if (avatar) updates['groupInfo.avatar'] = avatar;
  const chat = await Chat.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('participants', 'name avatar');
  res.json({ success: true, data: chat });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).json({ success: false, message: 'Group not found' });
  if (chat.groupInfo.superAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only super admin can delete group' });
  }
  await Message.deleteMany({ chat: req.params.id });
  await Chat.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Group deleted' });
});

export const addMembers = asyncHandler(async (req, res) => {
  const { members } = req.body;
  await Chat.findByIdAndUpdate(req.params.id, { $addToSet: { participants: { $each: members } } });
  const chat = await Chat.findById(req.params.id).populate('participants', 'name avatar');
  res.json({ success: true, data: chat });
});

export const removeMember = asyncHandler(async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.id, {
    $pull: { participants: req.params.userId, 'groupInfo.admins': req.params.userId }
  });
  res.json({ success: true, message: 'Member removed' });
});

export const makeAdmin = asyncHandler(async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.id, { $addToSet: { 'groupInfo.admins': req.params.userId } });
  res.json({ success: true, message: 'Admin added' });
});

export const removeAdmin = asyncHandler(async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.id, { $pull: { 'groupInfo.admins': req.params.userId } });
  res.json({ success: true, message: 'Admin removed' });
});

export const leaveGroup = asyncHandler(async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.id, {
    $pull: { participants: req.user._id, 'groupInfo.admins': req.user._id }
  });
  await Message.create({
    chat: req.params.id, sender: req.user._id, type: 'system',
    content: `${req.user.name} left the group`
  });
  res.json({ success: true, message: 'Left group' });
});

export const getInviteLink = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).select('groupInfo.inviteLink groupInfo.inviteLinkEnabled');
  res.json({ success: true, data: { inviteLink: chat.groupInfo.inviteLink, enabled: chat.groupInfo.inviteLinkEnabled } });
});

export const resetInviteLink = asyncHandler(async (req, res) => {
  const inviteLink = crypto.randomBytes(8).toString('hex');
  await Chat.findByIdAndUpdate(req.params.id, { 'groupInfo.inviteLink': inviteLink });
  res.json({ success: true, data: { inviteLink } });
});

export const joinByInvite = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ 'groupInfo.inviteLink': req.params.code, 'groupInfo.inviteLinkEnabled': true });
  if (!chat) return res.status(404).json({ success: false, message: 'Invalid invite link' });
  if (chat.participants.includes(req.user._id)) return res.json({ success: true, message: 'Already a member', data: chat });

  if (chat.groupInfo.settings.approvalRequired) {
    return res.json({ success: true, message: 'Join request sent', requiresApproval: true });
  }

  await Chat.findByIdAndUpdate(chat._id, { $addToSet: { participants: req.user._id } });
  await Message.create({
    chat: chat._id, sender: req.user._id, type: 'system',
    content: `${req.user.name} joined via invite link`
  });
  const updated = await Chat.findById(chat._id).populate('participants', 'name avatar');
  res.json({ success: true, data: updated });
});

export const createPoll = asyncHandler(async (req, res) => {
  const { question, options, allowMultiple, isAnonymous, expiresAt } = req.body;
  const poll = await Poll.create({
    chat: req.params.id, creator: req.user._id, question,
    options: options.map(text => ({ text, votes: [] })),
    allowMultiple, isAnonymous, expiresAt
  });
  const msg = await Message.create({
    chat: req.params.id, sender: req.user._id, type: 'system',
    content: `📊 Poll: ${question}`
  });
  await Chat.findByIdAndUpdate(req.params.id, { lastMessage: msg._id });
  res.status(201).json({ success: true, data: poll });
});

export const votePoll = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;
  const poll = await Poll.findById(req.params.pollId);
  if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

  if (!poll.allowMultiple) {
    poll.options.forEach(opt => { opt.votes = opt.votes.filter(v => v.toString() !== req.user._id.toString()); });
  }

  const option = poll.options[optionIndex];
  if (!option) return res.status(400).json({ success: false, message: 'Invalid option' });

  const existingVote = option.votes.findIndex(v => v.toString() === req.user._id.toString());
  if (existingVote !== -1) option.votes.splice(existingVote, 1);
  else option.votes.push(req.user._id);

  await poll.save();
  res.json({ success: true, data: poll });
});

export const updateGroupSettings = asyncHandler(async (req, res) => {
  const { onlyAdminsCanMessage, onlyAdminsCanEditInfo, approvalRequired } = req.body;
  const updates = {};
  if (onlyAdminsCanMessage !== undefined) updates['groupInfo.settings.onlyAdminsCanMessage'] = onlyAdminsCanMessage;
  if (onlyAdminsCanEditInfo !== undefined) updates['groupInfo.settings.onlyAdminsCanEditInfo'] = onlyAdminsCanEditInfo;
  if (approvalRequired !== undefined) updates['groupInfo.settings.approvalRequired'] = approvalRequired;
  const chat = await Chat.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, data: chat.groupInfo.settings });
});
