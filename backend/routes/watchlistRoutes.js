import express from 'express';
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  compareLoans,
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sab routes protected
router.use(protect);

router.post('/', addToWatchlist);
router.get('/', getWatchlist);
router.post('/compare', compareLoans); // ⚠️ :id se pehle
router.put('/:id', updateWatchlistItem);
router.delete('/:id', removeFromWatchlist);

export default router;