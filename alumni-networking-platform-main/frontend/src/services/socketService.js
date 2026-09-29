import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Socket.io Client Service
 */
export const socketService = {
  /**
   * Connect to Socket.io server with JWT authentication
   * @param {string} token
   * @returns {Socket}
   */
  connect: (token) => {
    if (!token) return null;

    if (socket && socket.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log(`[SocketService] Connected with socket ID: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
      console.warn(`[SocketService] Connection error: ${err.message}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[SocketService] Disconnected: ${reason}`);
    });

    return socket;
  },

  /**
   * Disconnect active socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Get active socket instance
   */
  getSocket: () => socket,
};

export default socketService;
