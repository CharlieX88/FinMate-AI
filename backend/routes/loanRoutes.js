import express from 'express';
import {
  getLoans,
  getLoanById,
  calculateEMI,
  checkLoanAffordability,
  getRecommendations,
} from '../controllers/loanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---- Public routes ----
router.get('/', getLoans);
router.post('/calculate-emi', calculateEMI);

// ---- Protected routes (need login) ----
router.post('/affordability', protect, checkLoanAffordability);
router.post('/recommendations', protect, getRecommendations);

// ---- Dynamic route (:id) — hamesha last mein ----
router.get('/:id', getLoanById);

export default router;