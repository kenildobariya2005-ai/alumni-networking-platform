import express from 'express';
import {
  verifyAlumni,
  removeAlumniVerification,
} from '../controllers/adminUserController.js';
import { objectIdParamValidator } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   PATCH /api/admin/alumni/:id/verify
 * @desc    Verify alumni account
 * @access  Private (Admin only)
 */
router.patch('/:id/verify', objectIdParamValidator, verifyAlumni);

/**
 * @route   PATCH /api/admin/alumni/:id/unverify
 * @desc    Remove alumni verification
 * @access  Private (Admin only)
 */
router.patch('/:id/unverify', objectIdParamValidator, removeAlumniVerification);

export default router;
