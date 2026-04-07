import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getCallHistory, logCall } from '../controllers/call.controller.js';

const router = express.Router();
router.use(protect);

router.get('/history', getCallHistory);
router.post('/log', logCall);

export default router;
