import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { getMe, updateMe, updateAvatar, searchUsers, getContacts, addContact, getUserById, updatePrivacy, updateNotifications, updateTheme, blockUser, unblockUser, getBlockedUsers, getStarredMessages, getLinkedDevices, removeLinkedDevice } from '../controllers/user.controller.js';

const router = express.Router();
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/avatar', uploadSingle, updateAvatar);
router.get('/me/contacts', getContacts);
router.post('/me/contacts', addContact);
router.get('/search', searchUsers);
router.get('/blocked', getBlockedUsers);
router.get('/starred-messages', getStarredMessages);
router.get('/linked-devices', getLinkedDevices);
router.delete('/linked-devices/:id', removeLinkedDevice);
router.put('/privacy', updatePrivacy);
router.put('/notifications', updateNotifications);
router.put('/theme', updateTheme);
router.post('/block/:id', blockUser);
router.delete('/block/:id', unblockUser);
router.get('/:id', getUserById);

export default router;
