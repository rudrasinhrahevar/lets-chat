import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getStats, getAllUsers, getUser, updateUser, banUser, unbanUser, changeRole, deleteUser,
  getAnalytics, getAdminChats, getAdminMessages,
  getLabels, createLabel, updateLabel, deleteLabel,
  getQuickReplies, createQuickReply, updateQuickReply, deleteQuickReply,
  getCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem,
  getAutomations, createAutomation, updateAutomation, deleteAutomation,
  getAgents, createAgent, deleteAgent
} from '../controllers/admin.controller.js';

const router = express.Router();
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.put('/users/:id/role', changeRole);
router.delete('/users/:id', deleteUser);

// Monitoring
router.get('/chats', getAdminChats);
router.get('/messages', getAdminMessages);

// Labels
router.get('/labels', getLabels);
router.post('/labels', createLabel);
router.put('/labels/:id', updateLabel);
router.delete('/labels/:id', deleteLabel);

// Quick Replies
router.get('/quick-replies', getQuickReplies);
router.post('/quick-replies', createQuickReply);
router.put('/quick-replies/:id', updateQuickReply);
router.delete('/quick-replies/:id', deleteQuickReply);

// Catalog
router.get('/catalog', getCatalog);
router.post('/catalog', createCatalogItem);
router.put('/catalog/:id', updateCatalogItem);
router.delete('/catalog/:id', deleteCatalogItem);

// Automations
router.get('/automations', getAutomations);
router.post('/automations', createAutomation);
router.put('/automations/:ruleId', updateAutomation);
router.delete('/automations/:ruleId', deleteAutomation);

// Agents
router.get('/agents', getAgents);
router.post('/agents', createAgent);
router.delete('/agents/:id', deleteAgent);

export default router;
