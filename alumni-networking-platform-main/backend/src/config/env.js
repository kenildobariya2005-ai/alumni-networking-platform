import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Robust Multi-Location .env Loader
 * Handles running from backend folder, repository root, or subdirectories
 */
const loadEnv = () => {
  const candidatePaths = [
    // 1. backend/.env relative to this file (backend/src/config/env.js -> backend/.env)
    path.resolve(__dirname, '../../.env'),
    // 2. alumni-networking-platform-main/backend/.env in current working directory
    path.resolve(process.cwd(), 'alumni-networking-platform-main/backend/.env'),
    // 3. backend/.env in current working directory (if started from project root)
    path.resolve(process.cwd(), 'backend/.env'),
    // 4. .env in current working directory
    path.resolve(process.cwd(), '.env'),
    // 5. Root .env relative to this file (alumni-networking-platform-main/.env)
    path.resolve(__dirname, '../../../.env'),
  ];

  let loaded = false;
  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    // Fallback standard load
    dotenv.config({ override: true });
  }

  // Fallback alias resolution: ensure GEMINI_API_KEY is populated if alternative keys are set
  if (!process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || '';
  }

  // Safe debugging (does NOT log the actual secret key)
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY;

  const hasGeminiKey = Boolean(
    rawKey &&
    typeof rawKey === 'string' &&
    rawKey.trim() !== '' &&
    rawKey.trim() !== 'YOUR_GEMINI_API_KEY' &&
    rawKey.trim() !== 'YOUR_ACTUAL_GEMINI_API_KEY' &&
    rawKey.trim() !== 'your_gemini_api_key_here' &&
    rawKey.trim() !== 'your_google_gemini_api_key_here' &&
    rawKey.trim() !== 'your_gemini_api_key_from_google_ai_studio'
  );

  const dummyCloudinaryNames = ['dummy_cloud_name', 'your_cloudinary_cloud_name', 'your_cloud_name'];
  const dummyCloudinaryKeys = ['dummy_api_key', 'your_cloudinary_api_key', 'your_api_key'];
  const dummyCloudinarySecrets = ['dummy_api_secret', 'your_cloudinary_api_secret', 'your_api_secret'];

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const hasCloudinary = Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !dummyCloudinaryNames.includes(cloudName) &&
    !dummyCloudinaryKeys.includes(apiKey) &&
    !dummyCloudinarySecrets.includes(apiSecret)
  );

  console.log(`Cloudinary configured: ${hasCloudinary}`);
};

loadEnv();

export default loadEnv;
