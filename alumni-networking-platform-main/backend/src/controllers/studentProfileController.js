import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import {
  uploadFileToGridFS,
  findGridFSFileById,
  openDownloadStream,
  deleteFileFromGridFS,
} from '../config/gridfs.js';
import mongoose from 'mongoose';

/**
 * Helper to parse comma separated string or array to clean array
 */
const parseToArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(item => item.trim());
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create student profile
 * @route   POST /api/student/profile
 * @access  Private (Student only)
 */
export const createStudentProfile = async (req, res, next) => {
  try {
    // Check if the user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can create a student profile.',
      });
    }

    // Check if profile already exists
    const profileExists = await StudentProfile.findOne({ user: req.user._id });
    if (profileExists) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists. Use PUT /api/student/profile to update.',
      });
    }

    const {
      enrollmentNumber,
      branch,
      semester,
      graduationYear,
      bio,
      skills,
      interests,
      github,
      linkedin,
      portfolio,
    } = req.body;

    let resumeFileId = null;
    let resumeUrl = '';
    // Store Resume in MongoDB GridFS if provided
    if (req.files && req.files.resume && req.files.resume[0]) {
      try {
        const resumeFile = req.files.resume[0];
        const sanitizedFilename = resumeFile.originalname
          ? resumeFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
          : `resume_${req.user._id}.pdf`;

        resumeFileId = await uploadFileToGridFS(
          resumeFile.buffer,
          sanitizedFilename,
          'application/pdf',
          { userId: req.user._id, originalName: resumeFile.originalname }
        );
        resumeUrl = `/api/student/profile/resume/${resumeFileId}`;
      } catch (uploadError) {
        console.error('[GridFS Resume Upload Error]:', uploadError?.message || uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to store resume in database GridFS. Please try again.',
        });
      }
    }

    // Upload Profile Picture to Cloudinary if provided
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      const uploadResult = await uploadBufferToCloudinary(
        req.files.profilePicture[0].buffer,
        'alumni_connect/avatars',
        'image'
      );
      // Update User profile picture
      await User.findByIdAndUpdate(req.user._id, {
        profilePicture: uploadResult.secure_url,
      });
    }

    const newProfile = await StudentProfile.create({
      user: req.user._id,
      enrollmentNumber,
      branch,
      semester,
      graduationYear,
      bio: bio || '',
      skills: parseToArray(skills),
      interests: parseToArray(interests),
      resumeFileId,
      resumeUrl,
      github: github || '',
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      profileCompleted: true,
    });

    const populatedProfile = await StudentProfile.findById(newProfile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      profile: populatedProfile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment number already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get current student's own profile
 * @route   GET /api/student/profile
 * @access  Private (Student/Admin)
 */
export const getMyStudentProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email role profilePicture'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please create one.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student profile
 * @route   PUT /api/student/profile
 * @access  Private (Student only)
 */
export const updateStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can edit student profiles.',
      });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please create a profile first.',
      });
    }

    const {
      enrollmentNumber,
      branch,
      semester,
      graduationYear,
      bio,
      skills,
      interests,
      github,
      linkedin,
      portfolio,
    } = req.body;

    // Update text fields if sent in request
    if (enrollmentNumber) profile.enrollmentNumber = enrollmentNumber;
    if (branch) profile.branch = branch;
    if (semester) profile.semester = semester;
    if (graduationYear) profile.graduationYear = graduationYear;
    if (bio !== undefined) profile.bio = bio;
    if (github !== undefined) profile.github = github;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (portfolio !== undefined) profile.portfolio = portfolio;

    if (skills !== undefined) {
      profile.skills = parseToArray(skills);
    }
    if (interests !== undefined) {
      profile.interests = parseToArray(interests);
    }

    // Process new Resume upload if sent
    if (req.files && req.files.resume && req.files.resume[0]) {
      const resumeFile = req.files.resume[0];
      // Delete old GridFS file if one exists to prevent orphaned files
      if (profile.resumeFileId) {
        await deleteFileFromGridFS(profile.resumeFileId);
      }

      try {
        const sanitizedFilename = resumeFile.originalname
          ? resumeFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
          : `resume_${req.user._id}.pdf`;

        const newFileId = await uploadFileToGridFS(
          resumeFile.buffer,
          sanitizedFilename,
          'application/pdf',
          { userId: req.user._id, originalName: resumeFile.originalname }
        );
        profile.resumeFileId = newFileId;
        profile.resumeUrl = `/api/student/profile/resume/${newFileId}`;
      } catch (uploadError) {
        console.error('[GridFS Resume Upload Error]:', uploadError?.message || uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to store resume in database GridFS. Please try again.',
        });
      }
    }

    // Process new Profile Picture upload if sent
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      const uploadResult = await uploadBufferToCloudinary(
        req.files.profilePicture[0].buffer,
        'alumni_connect/avatars',
        'image'
      );
      await User.findByIdAndUpdate(req.user._id, {
        profilePicture: uploadResult.secure_url,
      });
    }

    profile.profileCompleted = true;
    await profile.save();

    const populatedProfile = await StudentProfile.findById(profile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      profile: populatedProfile,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment number already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get student profile by profile ID or user ID
 * @route   GET /api/student/:id
 * @access  Private (Authenticated)
 */
export const getStudentById = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format provided.',
    });
  }

  try {
    // 1. Try to find by profile ID
    let profile = await StudentProfile.findById(id).populate(
      'user',
      'fullName email role profilePicture'
    );

    // 2. If not found, try to find by User ID
    if (!profile) {
      profile = await StudentProfile.findOne({ user: id }).populate(
        'user',
        'fullName email role profilePicture'
      );
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload / Update student resume
 * @route   POST /api/student/profile/resume
 * @route   PUT /api/student/profile/resume
 * @access  Private (Student only)
 */
export const updateStudentResume = async (req, res, next) => {
  try {
    // 1. Check if the user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students are permitted to upload a resume',
      });
    }

    // 2. Check if student profile exists
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please complete your profile details first.',
      });
    }

    // 3. Check if file is uploaded
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF resume',
      });
    }

    // 4. Validate mimetype and extension is PDF (double check)
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
    const isPdfExt = file.originalname && file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF is allowed for resume!',
      });
    }

    // 5. Remove previous GridFS file if one exists (prevents orphaned files)
    if (profile.resumeFileId) {
      await deleteFileFromGridFS(profile.resumeFileId);
    }

    // 6. Store file in MongoDB GridFS
    const sanitizedFilename = file.originalname
      ? file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
      : `resume_${req.user._id}.pdf`;

    let newFileId;
    try {
      newFileId = await uploadFileToGridFS(
        file.buffer,
        sanitizedFilename,
        'application/pdf',
        { userId: req.user._id, originalName: file.originalname }
      );
    } catch (uploadError) {
      console.error('[GridFS Resume Upload Error]:', uploadError?.message || uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to store resume in database GridFS. Please try again.',
      });
    }

    // 7. Save GridFS file ID and resumeUrl in student profile
    try {
      profile.resumeFileId = newFileId;
      profile.resumeUrl = `/api/student/profile/resume/${newFileId}`;
      profile.profileCompleted = true;
      await profile.save();
    } catch (dbError) {
      console.error('[Database Save Error]:', dbError?.message || dbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update student profile in database.',
      });
    }

    const populatedProfile = await StudentProfile.findById(profile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeFileId: profile.resumeFileId,
      resumeUrl: profile.resumeUrl,
      profile: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download / Stream Student Resume PDF from MongoDB GridFS
 * @route   GET /api/student/profile/resume
 * @route   GET /api/student/profile/resume/:fileId
 * @access  Private (Owner Student, Admin, or authorized Alumni)
 */
export const getStudentResume = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    let targetFileId = fileId;
    let targetProfile = null;

    // 1. If fileId is not in params, get the authenticated student's own resume
    if (!targetFileId) {
      targetProfile = await StudentProfile.findOne({ user: req.user._id });
      if (!targetProfile || !targetProfile.resumeFileId) {
        return res.status(404).json({
          success: false,
          message: 'No resume found for this student profile.',
        });
      }
      targetFileId = targetProfile.resumeFileId;
    } else {
      // 2. fileId was specified - find student profile by resumeFileId
      targetProfile = await StudentProfile.findOne({ resumeFileId: targetFileId });
      if (!targetProfile) {
        return res.status(404).json({
          success: false,
          message: 'Resume file not found in student records.',
        });
      }

      // Check authorization
      const isOwner = targetProfile.user.equals(req.user._id);
      const isAdmin = req.user.role === 'admin';
      let isAuthorizedAlumni = false;

      if (req.user.role === 'alumni') {
        const application = await Application.findOne({
          student: targetProfile.user,
        }).populate('job');
        if (
          application &&
          application.job &&
          application.job.alumni &&
          application.job.alumni.equals(req.user._id)
        ) {
          isAuthorizedAlumni = true;
        }
      }

      if (!isOwner && !isAdmin && !isAuthorizedAlumni) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resume.',
        });
      }
    }

    // 3. Retrieve file metadata from GridFS
    const file = await findGridFSFileById(targetFileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found in storage.',
      });
    }

    // 4. Set headers to stream PDF
    res.setHeader('Content-Type', file.contentType || 'application/pdf');
    const filename = file.filename || 'resume.pdf';
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    if (file.length) {
      res.setHeader('Content-Length', file.length);
    }

    // 5. Open and pipe download stream
    const downloadStream = openDownloadStream(targetFileId);
    downloadStream.on('error', (err) => {
      console.error('[GridFS Download Error]:', err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream resume file from storage.',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student resume from MongoDB GridFS
 * @route   DELETE /api/student/profile/resume
 * @access  Private (Student only)
 */
export const deleteStudentResume = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can delete their resume',
      });
    }

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    if (profile.resumeFileId) {
      await deleteFileFromGridFS(profile.resumeFileId);
      profile.resumeFileId = null;
      profile.resumeUrl = '';
      await profile.save();
    }

    const populatedProfile = await StudentProfile.findById(profile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      profile: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
