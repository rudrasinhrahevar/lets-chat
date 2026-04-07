import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware.js';
import { uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/media.controller.js';

const router = express.Router();
router.use(protect);

router.post('/upload', uploadSingle, uploadFile);
router.post('/upload-multiple', uploadMultiple, uploadMultipleFiles);
router.delete('/:publicId(*)', deleteFile);

export default router;
