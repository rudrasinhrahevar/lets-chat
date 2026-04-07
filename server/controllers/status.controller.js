import Status from '../models/Status.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

export const getAllStatuses = asyncHandler(async (req, res) => {
  const statuses = await Status.find({
    expiresAt: { $gt: new Date() },
    hiddenFrom: { $ne: req.user._id }
  })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  // Group by user
  const grouped = {};
  statuses.forEach(s => {
    const uid = s.user._id.toString();
    if (!grouped[uid]) grouped[uid] = { user: s.user, statuses: [] };
    grouped[uid].statuses.push(s);
  });

  res.json({ success: true, data: Object.values(grouped) });
});

export const createStatus = asyncHandler(async (req, res) => {
  const { type, content, background, font, privacy, hiddenFrom, sharedWith } = req.body;
  let media = null;

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'statuses', resource_type: resourceType });
    media = { url: result.secure_url, publicId: result.public_id, mimeType: req.file.mimetype };
  }

  const status = await Status.create({
    user: req.user._id, type: type || 'text',
    content, media, background, font,
    privacy: privacy || 'everyone',
    hiddenFrom: hiddenFrom || [],
    sharedWith: sharedWith || []
  });
  await status.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: status });
});

export const getMyStatuses = asyncHandler(async (req, res) => {
  const statuses = await Status.find({ user: req.user._id })
    .populate('viewers.user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: statuses });
});

export const deleteStatus = asyncHandler(async (req, res) => {
  const status = await Status.findById(req.params.id);
  if (!status) return res.status(404).json({ success: false, message: 'Status not found' });
  if (status.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your status' });
  if (status.media?.publicId) await cloudinary.uploader.destroy(status.media.publicId);
  await Status.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Status deleted' });
});

export const getUserStatuses = asyncHandler(async (req, res) => {
  const statuses = await Status.find({
    user: req.params.userId,
    expiresAt: { $gt: new Date() },
    hiddenFrom: { $ne: req.user._id }
  }).populate('user', 'name avatar').sort({ createdAt: 1 });
  res.json({ success: true, data: statuses });
});

export const reactToStatus = asyncHandler(async (req, res) => {
  const { reaction } = req.body;
  await Status.findOneAndUpdate(
    { _id: req.params.id, 'viewers.user': req.user._id },
    { $set: { 'viewers.$.reaction': reaction } }
  );
  res.json({ success: true, message: 'Reaction added' });
});

export const updateStatusPrivacy = asyncHandler(async (req, res) => {
  const { privacy, hiddenFrom, sharedWith } = req.body;
  await Status.findByIdAndUpdate(req.params.id, { privacy, hiddenFrom, sharedWith });
  res.json({ success: true, message: 'Privacy updated' });
});
