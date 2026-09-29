import './config/env.js';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocketServer } from './socket/socketServer.js';

// Connect to Database
connectDB();

// Create HTTP server integrating Express
const server = http.createServer(app);

// Initialize Socket.io real-time engine
initSocketServer(server);

// Define PORT
const PORT = process.env.PORT || 5000;

// Listen on server
const expressServer = server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io initialized and listening on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  expressServer.close(() => process.exit(1));
});

export default server;
