import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createBroadcast, getBroadcasts, deleteBroadcast, sendBroadcastMessage, getBroadcastStats } from '../controllers/broadcast.controller.js';

const router = express.Router();
router.use(protect);

router.post('/', createBroadcast);
router.get('/', getBroadcasts);
router.delete('/:id', deleteBroadcast);
router.post('/:id/send', sendBroadcastMessage);
router.get('/:id/stats', getBroadcastStats);

export default router;
