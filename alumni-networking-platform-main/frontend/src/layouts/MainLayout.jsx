import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar.jsx';
import Footer from '../components/layout/Footer.jsx';

/**
 * Main Layout for public and general platform views in dark theme
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#CBD5E1]">
      <PublicNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
