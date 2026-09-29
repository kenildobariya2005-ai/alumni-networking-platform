import React from 'react';
import useAuth from '../../hooks/useAuth.js';
import StudentProfile from '../student/StudentProfile.jsx';
import AlumniProfile from '../alumni/AlumniProfile.jsx';

export const ProfilePage = () => {
  const { user } = useAuth();
  const role = (user?.role || 'student').toLowerCase();

  if (role === 'alumni') {
    return <AlumniProfile />;
  }

  return <StudentProfile />;
};

export default ProfilePage;
