import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { adminListQueryValidator } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit trail logs with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/', adminListQueryValidator, getAuditLogs);

export default router;
