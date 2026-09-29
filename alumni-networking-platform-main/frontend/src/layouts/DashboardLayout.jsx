import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import AIChatbot from '../components/ai/AIChatbot.jsx';
import useAuth from '../hooks/useAuth.js';

/**
 * Dashboard Layout for Student, Alumni, and Admin workspaces in dark theme
 */
export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#CBD5E1] flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant (for Student and Alumni users) */}
      {user?.role !== 'admin' && (
        <AIChatbot isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
