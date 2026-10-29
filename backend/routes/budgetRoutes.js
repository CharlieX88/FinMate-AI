import express from 'express';
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getCategoryBreakdown,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Static routes pehle (⚠️ order important)
router.get('/summary', getMonthlySummary);
router.get('/category-breakdown', getCategoryBreakdown);

// CRUD
router.post('/', addTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;