import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { getAllStatuses, createStatus, getMyStatuses, deleteStatus, getUserStatuses, reactToStatus, updateStatusPrivacy } from '../controllers/status.controller.js';

const router = express.Router();
router.use(protect);

router.get('/', getAllStatuses);
router.post('/', uploadSingle, createStatus);
router.get('/my', getMyStatuses);
router.delete('/:id', deleteStatus);
router.get('/:userId', getUserStatuses);
router.post('/:id/react', reactToStatus);
router.put('/:id/privacy', updateStatusPrivacy);

export default router;
