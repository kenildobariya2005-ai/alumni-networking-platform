import express from 'express';
import {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  searchJobs,
  closeJob,
} from '../controllers/jobController.js';
import {
  createJobValidator,
  updateJobValidator,
} from '../validators/jobValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All job routes require authentication
router.use(protect);

// Specific sub-paths defined BEFORE /:id to prevent matching 'my' or 'search' as an ID
router.post(
  '/',
  authorizeRoles('alumni', 'admin'),
  createJobValidator,
  createJob
);

router.get('/', getAllJobs);
router.get('/search', searchJobs);
router.get('/my/posted', authorizeRoles('alumni', 'admin'), getMyPostedJobs);

router.get('/:id', getSingleJob);

router.put(
  '/:id',
  authorizeRoles('alumni', 'admin'),
  updateJobValidator,
  updateJob
);

router.delete(
  '/:id',
  authorizeRoles('alumni', 'admin'),
  deleteJob
);

router.patch(
  '/:id/status',
  authorizeRoles('alumni', 'admin'),
  closeJob
);

export default router;
