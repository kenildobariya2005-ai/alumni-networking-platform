import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import loadEnv from '../config/env.js';

const DUMMY_PLACEHOLDERS = new Set([
  'dummy_cloud_name',
  'dummy_api_key',
  'dummy_api_secret',
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret',
  'your_cloud_name',
  'your_api_key',
  'your_api_secret',
]);

/**
 * Validates whether Cloudinary is properly configured with non-dummy credentials
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  // If variables are missing, trigger loadEnv() to reload from disk in case .env was updated
  if (!cloudName || !apiKey || !apiSecret) {
    loadEnv();
    cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  }

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  if (
    DUMMY_PLACEHOLDERS.has(cloudName) ||
    DUMMY_PLACEHOLDERS.has(apiKey) ||
    DUMMY_PLACEHOLDERS.has(apiSecret)
  ) {
    return false;
  }

  return true;
};

/**
 * Configures Cloudinary SDK if valid credentials are provided
 * @returns {boolean}
 */
export const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });

  return true;
};

// Initial configuration attempt on module load
configureCloudinary();

/**
 * Upload file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Destination folder on Cloudinary
 * @param {string} resourceType - 'image', 'raw', or 'auto'
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (
  buffer,
  folder = 'alumni_connect',
  resourceType = 'auto',
  options = {}
) => {
  return new Promise((resolve, reject) => {
    if (!configureCloudinary()) {
      return reject(new Error('Cloudinary is not configured on the server.'));
    }

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Convert buffer to readable stream and pipe it to Cloudinary
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export default cloudinary;
