import axios from 'axios';

// Obtain API Base URL from Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  TOKEN: 'alumniconnect_token',
  USER: 'alumniconnect_user',
};

/**
 * Axios instance configured for AlumniConnect Backend
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

/**
 * Request Interceptor: Attach JWT Bearer Token if present in storage
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[API Service] Failed to read token from localStorage:', err);
    }

    // If data is FormData, remove Content-Type so browser/Axios sets multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Format error responses and handle 401 Unauthorized
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle session expiration / unauthorized status on protected endpoints
    if (error.response && error.response.status === 401) {
      const requestUrl = originalRequest?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        // Clear invalid token and notify application to reset auth context
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const errorData = error.response?.data;
    let errorMessage =
      errorData?.message ||
      error.message ||
      'An unexpected network or server error occurred';

    // If validation error and specific field errors exist, provide detailed field feedback
    if (
      errorMessage === 'Validation failed' &&
      Array.isArray(errorData?.errors) &&
      errorData.errors.length > 0
    ) {
      const fieldDetails = errorData.errors
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .filter(Boolean)
        .join(', ');
      if (fieldDetails) {
        errorMessage = `Validation failed: ${fieldDetails}`;
      }
    }

    // Standardize error payload for frontend consumption
    const formattedError = {
      status: error.response?.status || (error.code === 'ECONNABORTED' ? 504 : 500),
      code: error.code,
      message: errorMessage,
      errors: errorData?.errors || null,
      raw: error,
    };

    return Promise.reject(formattedError);
  }
);

export default api;
