import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Loader from '../components/common/Loader.jsx';
import ROUTES from '../constants/routes.js';

/**
 * Route protection wrapper verifying authentication and role authorization
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Optional array of authorized user roles (e.g. ['student'], ['alumni'], ['admin'])
 * @param {React.ReactNode} [props.children]
 */
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Show loader during session verification
  if (loading) {
    return <Loader fullScreen message="Verifying session..." />;
  }

  // 2. Redirect unauthenticated users to appropriate login portal
  if (!isAuthenticated || !user) {
    const isAttemptingAdmin = location.pathname.toLowerCase().startsWith('/admin');
    const redirectTarget = isAttemptingAdmin ? (ROUTES.ADMIN_LOGIN || '/admin/login') : ROUTES.LOGIN;
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  // 3. Verify role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase().trim();
    const isAuthorized = allowedRoles.map((r) => r.toLowerCase().trim()).includes(userRole);

    if (!isAuthorized) {
      // Redirect unauthorized users to the Dedicated Unauthorized (403) page
      return <Navigate to={ROUTES.UNAUTHORIZED} state={{ from: location }} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
