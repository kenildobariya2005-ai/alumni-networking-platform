import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  const { fullName, email, password, role, profilePicture } = req.body;

  try {
    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Ensure role cannot be self-assigned as 'admin'
    const assignedRole = role && String(role).toLowerCase() === 'alumni' ? 'alumni' : 'student';

    // Create user (password will be hashed in the pre-save hook)
    const user = await User.create({
      fullName,
      email,
      password,
      role: assignedRole,
      profilePicture: profilePicture || '',
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      // Set cookie (optional but highly recommended for web client security)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Exclude password from output
      const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: userResponse,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Role Verification check (Student vs Alumni vs Admin portals)
    const targetRole = req.body.expectedRole || req.body.role;
    if (targetRole) {
      const normalizedTarget = String(targetRole).toLowerCase().trim();
      if (user.role !== normalizedTarget) {
        if (normalizedTarget === 'student' && user.role === 'alumni') {
          return res.status(403).json({
            success: false,
            message: 'This account is registered as an Alumni account. Please use Alumni Login.',
          });
        }
        if (normalizedTarget === 'student' && user.role === 'admin') {
          return res.status(403).json({
            success: false,
            message: 'This account is registered as an Admin account. Please use Admin Login.',
          });
        }
        if (normalizedTarget === 'alumni' && user.role === 'student') {
          return res.status(403).json({
            success: false,
            message: 'This account is registered as a Student account. Please use Student Login.',
          });
        }
        if (normalizedTarget === 'alumni' && user.role === 'admin') {
          return res.status(403).json({
            success: false,
            message: 'This account is registered as an Admin account. Please use Admin Login.',
          });
        }
        return res.status(403).json({
          success: false,
          message: `Access denied. This login portal is restricted to ${normalizedTarget} accounts.`,
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Exclude password from output
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private (Authenticated)
 */
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private (Authenticated)
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware, containing all user details except password
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
