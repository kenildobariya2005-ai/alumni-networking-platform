import React from 'react';
import useAuth from '../../hooks/useAuth.js';
import AdminSidebar from './sidebar/AdminSidebar.jsx';
import AlumniSidebar from './sidebar/AlumniSidebar.jsx';
import StudentSidebar from './sidebar/StudentSidebar.jsx';

/**
 * Role-aware dynamic sidebar router
 * Strictly separates Admin, Alumni, and Student navigation structures and visual hierarchies
 */
export const Sidebar = ({ isOpen, onClose, onOpenAI }) => {
  const { user } = useAuth();
  const role = (user?.role || 'student').toLowerCase().trim();

  if (role === 'admin') {
    return <AdminSidebar isOpen={isOpen} onClose={onClose} />;
  }

  if (role === 'alumni') {
    return <AlumniSidebar isOpen={isOpen} onClose={onClose} onOpenAI={onOpenAI} />;
  }

  return <StudentSidebar isOpen={isOpen} onClose={onClose} onOpenAI={onOpenAI} />;
};

export default Sidebar;
