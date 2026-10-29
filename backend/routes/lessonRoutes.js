import express from 'express';
import {
  getLessons,
  getLessonBySlug,
  markLessonComplete,
  getMyProgress,
} from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes PEHLE (order important)
router.get('/progress/me', protect, getMyProgress);

// Public
router.get('/', getLessons);

// Dynamic routes LAST mein
router.post('/:slug/complete', protect, markLessonComplete);
router.get('/:slug', getLessonBySlug);

export default router;