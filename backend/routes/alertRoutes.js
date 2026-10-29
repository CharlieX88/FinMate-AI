import express from 'express';
import {
  createAlert,
  getAlerts,
  markAsRead,
  markAllAsRead,
  deleteAlert,
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Static routes pehle
router.put('/read-all', markAllAsRead);

// CRUD
router.post('/', createAlert);
router.get('/', getAlerts);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteAlert);

export default router;