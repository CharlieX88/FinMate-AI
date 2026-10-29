import express from 'express';
import {
  chatWithAI,
  getAIInsights,
  aiExplainEMI,
  aiExplainRecommendations,
  simulateLoanScenario // 👈 Naya import
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/explain-emi', aiExplainEMI);

// Protected routes
router.post('/chat', protect, chatWithAI);
router.get('/insights', protect, getAIInsights);
router.post('/explain-recommendations', protect, aiExplainRecommendations);
router.post('/simulate-loan', protect, simulateLoanScenario); // 👈 Naya route

export default router;