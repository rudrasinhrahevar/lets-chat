import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getMyChats, createPrivateChat, getChatById, clearChat, pinChat, archiveChat, muteChat, setDisappearing, setChatWallpaper, lockChat } from '../controllers/chat.controller.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyChats);
router.post('/private', createPrivateChat);
router.get('/:id', getChatById);
router.delete('/:id/clear', clearChat);
router.put('/:id/pin', pinChat);
router.put('/:id/archive', archiveChat);
router.put('/:id/mute', muteChat);
router.put('/:id/disappearing', setDisappearing);
router.put('/:id/wallpaper', setChatWallpaper);
router.put('/:id/lock', lockChat);

export default router;
