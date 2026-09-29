import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user ID to include in the payload
 * @returns {string} The signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default_local_dev_secret_key_12345',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

export default generateToken;
