import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateOnboarding,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

// @route POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

// @route POST /api/auth/logout
router.post('/logout', protect, logoutUser);

// @route GET /api/auth/me
router.get('/me', protect, getMe);

// @route PUT /api/auth/onboarding
router.put('/onboarding', protect, updateOnboarding);

export default router;