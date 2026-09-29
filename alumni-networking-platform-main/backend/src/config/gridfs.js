import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

let gridfsBucket = null;

/**
 * Get or initialize the GridFSBucket using the existing Mongoose connection
 * @returns {GridFSBucket}
 */
export const getGridFSBucket = () => {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('Database connection is not open. Cannot initialize GridFSBucket.');
  }

  if (!gridfsBucket) {
    gridfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'fs', // default bucket producing fs.files and fs.chunks
    });
  }

  return gridfsBucket;
};

/**
 * Upload a buffer to MongoDB GridFS
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original or sanitized file name
 * @param {string} mimetype - Content type (e.g. application/pdf)
 * @param {object} metadata - Optional metadata (userId, uploadedAt, etc.)
 * @returns {Promise<ObjectId>} The GridFS file ID
 */
export const uploadFileToGridFS = (buffer, filename, mimetype = 'application/pdf', metadata = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimetype,
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
        },
      });

      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);

      readable
        .pipe(uploadStream)
        .on('finish', () => {
          resolve(uploadStream.id);
        })
        .on('error', (err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Find file metadata from GridFS by ID
 * @param {string|ObjectId} fileId
 * @returns {Promise<object|null>} GridFS file document or null
 */
export const findGridFSFileById = async (fileId) => {
  if (!fileId || !ObjectId.isValid(fileId)) {
    return null;
  }
  const bucket = getGridFSBucket();
  const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
  return files.length > 0 ? files[0] : null;
};

/**
 * Open a download stream for a GridFS file
 * @param {string|ObjectId} fileId
 * @returns {GridFSBucketReadStream}
 */
export const openDownloadStream = (fileId) => {
  if (!fileId || !ObjectId.isValid(fileId)) {
    throw new Error('Invalid GridFS file ID format');
  }
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new ObjectId(fileId));
};

/**
 * Delete a file and its chunks from GridFS by ID
 * @param {string|ObjectId} fileId
 * @returns {Promise<boolean>}
 */
export const deleteFileFromGridFS = async (fileId) => {
  if (!fileId || !ObjectId.isValid(fileId)) {
    return false;
  }
  try {
    const bucket = getGridFSBucket();
    const id = new ObjectId(fileId);
    const files = await bucket.find({ _id: id }).toArray();
    if (files.length > 0) {
      await bucket.delete(id);
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[GridFS] Warning: Could not delete file ${fileId}: ${err.message}`);
    return false;
  }
};
