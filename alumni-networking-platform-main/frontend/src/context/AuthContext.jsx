import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.js';
import { STORAGE_KEYS } from '../services/api.js';

export const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Helper to persist credentials in localStorage
   */
  const persistAuth = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    try {
      if (jwtToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, jwtToken);
        localStorage.setItem('token', jwtToken); // backwards compatibility
      }
      if (userData) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('[AuthContext] Error persisting credentials to storage:', err);
    }
  }, []);

  /**
   * Helper to clear credentials from state and localStorage
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      console.error('[AuthContext] Error clearing stored credentials:', err);
    }
  }, []);

  /**
   * Fetch current user profile from backend
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      if (data && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        } catch (err) {
          console.error('[AuthContext] Error caching user profile:', err);
        }
        return data.user;
      }
      return null;
    } catch (error) {
      console.warn('[AuthContext] Failed to refresh profile:', error.message);
      return null;
    }
  }, []);

  /**
   * Initial authentication verification on application startup
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken =
          localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
        const storedUser =
          localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);

          // Optimistically load cached user if available
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // Ignore JSON parse error and let profile API load fresh data
            }
          }

          // Verify token validity by requesting fresh profile from backend
          try {
            const data = await authService.getProfile();
            if (data && data.user) {
              persistAuth(data.user, storedToken);
            } else {
              clearAuth();
            }
          } catch (profileErr) {
            console.warn('[AuthContext] Token validation failed:', profileErr.message);
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('[AuthContext] Error during auth initialization:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [persistAuth, clearAuth]);

  /**
   * Listen for global 401 unauthorized events from Axios interceptors
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
      toast.error('Session expired. Please sign in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearAuth]);

  /**
   * Login method
   * @param {object} credentials { email, password }
   * @returns {Promise<object>}
   */
  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      if (data && data.token && data.user) {
        persistAuth(data.user, data.token);
      }
      return data;
    },
    [persistAuth]
  );

  /**
   * Register method
   * @param {object} userData { fullName, email, password, role }
   * @returns {Promise<object>}
   */
  const register = useCallback(
    async (userData) => {
      const data = await authService.register(userData);
      if (data && data.token && data.user) {
        persistAuth(data.user, data.token);
      }
      return data;
    },
    [persistAuth]
  );

  /**
   * Logout method
   * @param {boolean} [showNotification=true]
   */
  const logout = useCallback(
    async (showNotification = true) => {
      try {
        await authService.logout();
      } catch (err) {
        // Proceed with client logout even if backend call fails
        console.warn('[AuthContext] Backend logout warning:', err.message);
      } finally {
        clearAuth();
        if (showNotification) {
          toast.success('Logged out successfully');
        }
      }
    },
    [clearAuth]
  );

  /**
   * Update current user in state & storage
   */
  const updateUser = useCallback(
    (updatedUserData) => {
      setUser((prev) => {
        const merged = { ...prev, ...updatedUserData };
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
        } catch (err) {
          console.error('[AuthContext] Error updating stored user:', err);
        }
        return merged;
      });
    },
    []
  );

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
