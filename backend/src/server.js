import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './socket/socket.js';

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Define PORT
const PORT = process.env.PORT || 5000;

// Listen on server
const expressServer = server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  expressServer.close(() => process.exit(1));
});
