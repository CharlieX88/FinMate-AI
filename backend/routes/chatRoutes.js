import express from 'express';
import { getChats, createChat, updateChat, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getChats).post(createChat);
router.route('/:id').put(updateChat).delete(deleteChat);

export default router;