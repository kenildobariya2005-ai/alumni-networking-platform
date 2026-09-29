import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes by verifying the JWT and attaching user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token parsing failed',
      });
    }
  } 
  // 2. Check for token in query parameter (for direct file streaming / browser new tab)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }
  // 3. Check for token in cookies (optional fallback)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_local_dev_secret_key_12345');

    // Get user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated, please contact administration',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error(`Token verification error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed',
    });
  }
};
