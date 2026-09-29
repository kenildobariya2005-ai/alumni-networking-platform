import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

/**
 * Root Application Component
 */
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          {/* Toast Notification Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '14px',
                borderRadius: '10px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />

          {/* Core Application Routes */}
          <AppRoutes />
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
