import express from 'express';
import {
  createStudentProfile,
  getMyStudentProfile,
  updateStudentProfile,
  getStudentById,
  updateStudentResume,
  getStudentResume,
  deleteStudentResume,
} from '../controllers/studentProfileController.js';
import {
  createStudentProfileValidator,
  updateStudentProfileValidator,
} from '../validators/studentProfileValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload, handleUploadErrors } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Define multer fields for upload
const uploadFields = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

// All routes are protected
router.use(protect);

router.post(
  '/profile',
  authorizeRoles('student'),
  uploadFields,
  handleUploadErrors,
  createStudentProfileValidator,
  createStudentProfile
);

router.get('/profile', getMyStudentProfile);

router.put(
  '/profile',
  authorizeRoles('student'),
  uploadFields,
  handleUploadErrors,
  updateStudentProfileValidator,
  updateStudentProfile
);

// View / Stream student resume from MongoDB GridFS
router.get('/profile/resume', getStudentResume);
router.get('/profile/resume/:fileId', getStudentResume);

// Upload / update student resume (POST & PUT supported)
router.post(
  '/profile/resume',
  authorizeRoles('student'),
  upload.single('resume'),
  handleUploadErrors,
  updateStudentResume
);

router.put(
  '/profile/resume',
  authorizeRoles('student'),
  upload.single('resume'),
  handleUploadErrors,
  updateStudentResume
);

// Delete student resume from MongoDB GridFS
router.delete(
  '/profile/resume',
  authorizeRoles('student'),
  deleteStudentResume
);

router.get('/:id', getStudentById);

export default router;
