import express from 'express';
import {
  createAlumniProfile,
  getMyAlumniProfile,
  updateAlumniProfile,
  getAlumniById,
  searchAlumni,
} from '../controllers/alumniProfileController.js';
import {
  createAlumniProfileValidator,
  updateAlumniProfileValidator,
} from '../validators/alumniProfileValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, handleUploadErrors } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Define multer fields for upload
const uploadFields = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
]);

// All routes are protected
router.use(protect);

// Search alumni route must be defined BEFORE the parametric /:id route
router.get('/', searchAlumni);

router.post(
  '/profile',
  uploadFields,
  handleUploadErrors,
  createAlumniProfileValidator,
  createAlumniProfile
);

router.get('/profile', getMyAlumniProfile);

router.put(
  '/profile',
  uploadFields,
  handleUploadErrors,
  updateAlumniProfileValidator,
  updateAlumniProfile
);

router.get('/:id', getAlumniById);

export default router;
