import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Feature Routes
import authRoutes from './routes/authRoutes.js';
import studentProfileRoutes from './routes/studentProfileRoutes.js';
import alumniProfileRoutes from './routes/alumniProfileRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import projectApplicationRoutes from './routes/projectApplicationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Admin Module Routes
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminAlumniRoutes from './routes/adminAlumniRoutes.js';
import adminJobRoutes from './routes/adminJobRoutes.js';
import adminProjectRoutes from './routes/adminProjectRoutes.js';
import adminModerationRoutes from './routes/adminModerationRoutes.js';
import adminMentorshipRoutes from './routes/adminMentorshipRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS configuration (allowing client domain and session credentials)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode
    },
    credentials: true,
  })
);

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

// 6. Public & User Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentProfileRoutes);
app.use('/api/alumni', alumniProfileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-applications', projectApplicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// 7. Admin Module Routes (Protected by protect + authorizeRoles('admin'))
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/alumni', adminAlumniRoutes);
app.use('/api/admin/jobs', adminJobRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/admin/moderation', adminModerationRoutes);
app.use('/api/admin/mentorship', adminMentorshipRoutes);
app.use('/api/admin/audit-logs', auditRoutes);

// Base / Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'AlumniConnect Backend API is active.',
  });
});

// 8. Error Middleware Handling
app.use(notFound);
app.use(errorHandler);

export default app;
