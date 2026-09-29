import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import socketService from '../services/socketService.js';

export const SocketContext = createContext(null);

/**
 * Socket.io Context Provider managing real-time connections based on auth state and current route
 * Only connects when authenticated AND outside of public landing/auth pages to prevent private data leakage.
 */
export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Identify public routes where socket connections should not be active
  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/student/login' ||
    location.pathname === '/alumni/login' ||
    location.pathname === '/admin/login' ||
    location.pathname === '/student/register' ||
    location.pathname === '/alumni/register' ||
    location.pathname === '/unauthorized';

  useEffect(() => {
    // Only connect when user is authenticated AND inside the authenticated workspace
    if (isAuthenticated && token && !isPublicPage) {
      const activeSocket = socketService.connect(token);
      setSocket(activeSocket);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      const handleOnlineList = (data) => {
        setOnlineUsers(data.onlineUserIds || []);
      };
      const handleUserOnline = (data) => {
        setOnlineUsers((prev) => Array.from(new Set([...prev, data.userId])));
      };
      const handleUserOffline = (data) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      };

      if (activeSocket) {
        activeSocket.on('connect', handleConnect);
        activeSocket.on('disconnect', handleDisconnect);
        activeSocket.on('user:online_list', handleOnlineList);
        activeSocket.on('user:online', handleUserOnline);
        activeSocket.on('user:offline', handleUserOffline);
      }

      return () => {
        if (activeSocket) {
          activeSocket.off('connect', handleConnect);
          activeSocket.off('disconnect', handleDisconnect);
          activeSocket.off('user:online_list', handleOnlineList);
          activeSocket.off('user:online', handleUserOnline);
          activeSocket.off('user:offline', handleUserOffline);
        }
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [isAuthenticated, token, isPublicPage]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.includes(userId?.toString()),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
