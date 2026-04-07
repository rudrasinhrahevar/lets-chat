import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getMessages, sendMessage, editMessage, deleteMessage, forwardMessage, starMessage, searchMessages, getStarredMessages, getChatMedia } from '../controllers/message.controller.js';

const router = express.Router();
router.use(protect);

router.get('/search', searchMessages);
router.get('/starred', getStarredMessages);
router.get('/:chatId', getMessages);
router.get('/:chatId/media', getChatMedia);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/forward', forwardMessage);
router.post('/:id/star', starMessage);

export default router;
