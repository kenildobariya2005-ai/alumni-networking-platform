import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import Button from '../components/common/Button.jsx';
import ROUTES from '../constants/routes.js';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 text-[#CBD5E1]">
      <div className="w-16 h-16 rounded-2xl bg-[#202B40] text-[#818CF8] border border-[#6366F1]/30 flex items-center justify-center mb-4">
        <HiOutlineQuestionMarkCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#F8FAFC] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-[#CBD5E1] mb-2">Page Not Found</h2>
      <p className="text-sm text-[#94A3B8] max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to={ROUTES.HOME}>
        <Button variant="primary" icon={HiOutlineHome} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
