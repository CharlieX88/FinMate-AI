import express from 'express';
import { calculateAndSaveScore, getCreditProfile } from '../controllers/creditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCreditProfile);
router.post('/calculate', calculateAndSaveScore);

export default router;