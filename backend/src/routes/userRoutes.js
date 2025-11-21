import express from 'express';
import { getProfile, updateProfile, getReputation, deactivateAccount, getProducts, filters, toggleUserStatus, getAllPublishedProducts, getProfileById, getConversations, sendMessage, getMessages } from '../controllers/userRobleController.js';
import { semanticSearch } from '../controllers/semanticSearchController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/profile/:userId', getProfileById);
router.put('/update', updateProfile);
router.get('/reputation', getReputation);
router.post('/deactivate', deactivateAccount);
router.get('/productos', getProducts);
router.get('/search', filters);
router.get('/semantic-search', semanticSearch);
router.get('/all-published', getAllPublishedProducts);
router.put('/admin/toggle-status', toggleUserStatus);
router.get('/conversations', getConversations);
router.post('/messages/send', sendMessage);
router.get('/messages/:userId', getMessages);

export default router;
