import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes (require valid JWT)
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router;
