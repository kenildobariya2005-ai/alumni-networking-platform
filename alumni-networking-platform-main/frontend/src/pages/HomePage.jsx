import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import Button from '../components/common/Button.jsx';
import ROUTES from '../constants/routes.js';

export const HomePage = () => {

  const features = [
    {
      title: 'Mentorship Network',
      description: 'Connect with verified alumni across industries for career guidance, mock interviews, and resume reviews.',
      icon: HiOutlineAcademicCap,
      color: 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/50',
    },
    {
      title: 'Job & Internship Portal',
      description: 'Access curated job opportunities and internal referrals posted directly by alumni working at top companies.',
      icon: HiOutlineBriefcase,
      color: 'bg-sky-950/70 text-sky-400 border border-sky-800/50',
    },
    {
      title: 'Project Collaboration',
      description: 'Build real-world team projects, collaborate across branches, and showcase production portfolios.',
      icon: HiOutlineSparkles,
      color: 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50',
    },
    {
      title: 'Community Feed & Chat',
      description: 'Engage in knowledge sharing, discussions, and direct real-time messaging with peers and seniors.',
      icon: HiOutlineUserGroup,
      color: 'bg-purple-950/70 text-purple-400 border border-purple-800/50',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10 text-[#CBD5E1]">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 text-primary-300 text-xs font-semibold border border-primary-800/60 shadow-sm">
          <HiOutlineShieldCheck className="w-4 h-4 text-primary-400" />
          <span>Secure University Networking & Mentorship Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Bridging the Gap Between <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
            Students & Alumni
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AlumniConnect empowers students and alumni to exchange career mentorship, explore jobs, collaborate on technical projects, and communicate in real time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to={ROUTES.STUDENT_LOGIN}>
            <Button size="lg" icon={HiOutlineAcademicCap} className="font-semibold shadow-soft-md">
              Student Login
            </Button>
          </Link>
          <Link to={ROUTES.ALUMNI_LOGIN}>
            <Button variant="outline" size="lg" icon={HiOutlineUserGroup} className="font-semibold text-indigo-300 border-indigo-700/60 hover:bg-indigo-950/60">
              Alumni Login
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="ghost" size="lg" icon={HiOutlineArrowRight}>
              Join the Network
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm hover:border-[#6366F1]/50 hover:shadow-soft-md transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default HomePage;
