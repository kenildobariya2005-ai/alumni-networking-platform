import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext.jsx';

/**
 * Custom hook to access SocketContext
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default useSocket;
