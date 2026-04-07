import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createGroup, getGroup, updateGroup, deleteGroup, addMembers, removeMember, makeAdmin, removeAdmin, leaveGroup, getInviteLink, resetInviteLink, joinByInvite, createPoll, votePoll, updateGroupSettings } from '../controllers/group.controller.js';

const router = express.Router();
router.use(protect);

router.post('/', createGroup);
router.get('/:id', getGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/members', addMembers);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/admin/:userId', makeAdmin);
router.delete('/:id/admin/:userId', removeAdmin);
router.post('/:id/leave', leaveGroup);
router.get('/:id/invite-link', getInviteLink);
router.post('/:id/invite-link/reset', resetInviteLink);
router.post('/join/:code', joinByInvite);
router.post('/:id/polls', createPoll);
router.put('/:id/polls/:pollId/vote', votePoll);
router.put('/:id/settings', updateGroupSettings);

export default router;
