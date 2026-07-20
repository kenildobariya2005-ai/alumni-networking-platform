import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS configuration (allowing client domain and session credentials)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// 3. Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request Body Parsers (JSON and URLencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Cookie Parser for parsing signed cookies
app.use(cookieParser());

// 6. Base / Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'healthy',
    message: 'AlumniConnect Backend API is active.' 
  });
});

// 7. Error Middleware Handling placeholders
app.use(notFound);
app.use(errorHandler);

export default app;
