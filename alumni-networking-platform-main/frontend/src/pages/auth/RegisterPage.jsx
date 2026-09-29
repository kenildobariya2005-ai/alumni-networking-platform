import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthContainer from './AuthContainer.jsx';

/**
 * Register View with animated slide-swapping transition
 */
export const RegisterPage = () => {
  const location = useLocation();

  const getInitialRole = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('alumni')) return 'alumni';
    if (path.includes('student')) return 'student';
    const params = new URLSearchParams(location.search);
    const queryRole = params.get('role')?.toLowerCase();
    if (queryRole === 'alumni' || queryRole === 'student') return queryRole;
    return 'student';
  };

  return <AuthContainer initialMode="register" initialRole={getInitialRole()} />;
};

export default RegisterPage;
