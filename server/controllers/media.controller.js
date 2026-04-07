import cloudinary from '../config/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  let resourceType = 'auto';
  if (req.file.mimetype.startsWith('video')) resourceType = 'video';
  else if (req.file.mimetype.startsWith('audio')) resourceType = 'video';
  else if (req.file.mimetype.startsWith('image')) resourceType = 'image';
  else resourceType = 'raw';

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'chat-media',
    resource_type: resourceType,
    ...(req.file.originalname && { public_id: `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}` })
  });

  res.json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      filename: req.file.originalname,
      filesize: req.file.size,
      width: result.width,
      height: result.height,
      duration: result.duration,
      thumbnail: result.eager?.[0]?.secure_url
    }
  });
});

export const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });

  const results = [];
  for (const file of req.files) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video')) resourceType = 'video';
    else if (file.mimetype.startsWith('audio')) resourceType = 'video';
    else if (file.mimetype.startsWith('image')) resourceType = 'image';
    else resourceType = 'raw';

    const result = await cloudinary.uploader.upload(dataURI, { folder: 'chat-media', resource_type: resourceType });
    results.push({
      url: result.secure_url, publicId: result.public_id,
      mimeType: file.mimetype, filename: file.originalname, filesize: file.size
    });
  }
  res.json({ success: true, data: results });
});

export const deleteFile = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: 'File deleted' });
});
