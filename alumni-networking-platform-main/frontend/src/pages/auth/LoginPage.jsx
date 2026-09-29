import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineChatAlt2,
  HiArrowRight,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

import ROUTES from '../../constants/routes.js';
import useAuth from '../../hooks/useAuth.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

// Left panel feature highlights
const FEATURES = [
  {
    icon: HiOutlineUserGroup,
    title: 'Grow Your Network',
    desc: 'Connect with students, alumni, and industry professionals across branches.',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Discover Opportunities',
    desc: 'Explore curated job postings, internships, and campus referrals.',
  },
  {
    icon: HiOutlineChatAlt2,
    title: '1-on-1 Mentorship',
    desc: 'Get personalized career guidance and roadmap reviews from verified alumni.',
  },
];

const PORTALS = {
  student: {
    key: 'student',
    label: 'Student',
    emoji: '🎓',
    title: '🎓 Student Login',
    subtext: 'Sign in to your student account',
    emailLabel: 'Student Email Address',
    emailPlaceholder: 'student@university.edu',
    submitText: 'Sign In as Student',
    submittingText: 'Signing in as Student…',
    registerText: 'Create Student Account',
    registerLink: '/student/register',
    showRegister: true,
    destination: ROUTES.STUDENT_DASHBOARD || '/student',
  },
  alumni: {
    key: 'alumni',
    label: 'Alumni',
    emoji: '🎓',
    title: '🎓 Alumni Login',
    subtext: 'Sign in to your alumni account',
    emailLabel: 'Alumni Email Address',
    emailPlaceholder: 'alumni@company.com or university email',
    submitText: 'Sign In as Alumni',
    submittingText: 'Signing in as Alumni…',
    registerText: 'Create Alumni Account',
    registerLink: '/alumni/register',
    showRegister: true,
    destination: ROUTES.ALUMNI_DASHBOARD || '/alumni',
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    emoji: '🛡',
    title: '🛡 Admin Login',
    subtext: 'Authorized platform administration',
    emailLabel: 'Admin Email Address',
    emailPlaceholder: 'admin@alumniconnect.com',
    submitText: 'Sign In as Admin',
    submittingText: 'Signing in as Admin…',
    registerText: null,
    registerLink: null,
    showRegister: false,
    destination: ROUTES.ADMIN_DASHBOARD || '/admin',
  },
};

export const LoginPage = ({ initialPortal }) => {
  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const determineInitialPortal = () => {
    if (initialPortal && PORTALS[initialPortal]) {
      return initialPortal;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes('admin')) return 'admin';
    if (path.includes('alumni')) return 'alumni';
    if (path.includes('student')) return 'student';
    const params = new URLSearchParams(location.search);
    const qPortal = params.get('portal')?.toLowerCase();
    if (qPortal && PORTALS[qPortal]) return qPortal;
    return 'student';
  };

  const [selectedPortal, setSelectedPortal] = useState(determineInitialPortal);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync portal if route or prop changes
  useEffect(() => {
    const desired = determineInitialPortal();
    if (desired !== selectedPortal) {
      setSelectedPortal(desired);
      setFormErrors({});
      setGeneralError('');
    }
  }, [location.pathname, initialPortal]);

  const handlePortalSwitch = (portalKey) => {
    if (portalKey === selectedPortal) return;
    setSelectedPortal(portalKey);
    setFormErrors({});
    setGeneralError('');
    setFormData((prev) => ({ ...prev, password: '' }));

    // Smoothly update browser URL without full reload
    const targetUrl =
      portalKey === 'admin'
        ? ROUTES.ADMIN_LOGIN
        : portalKey === 'alumni'
        ? ROUTES.ALUMNI_LOGIN
        : ROUTES.STUDENT_LOGIN;

    window.history.replaceState(null, '', targetUrl);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const currentConfig = PORTALS[selectedPortal];
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = `${currentConfig.emailLabel} is required.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setGeneralError('');

    try {
      const data = await login({
        email: formData.email.trim(),
        password: formData.password,
        expectedRole: selectedPortal,
      });

      // Strict role verification: confirm returned user actually has selectedPortal role
      const returnedRole = (data?.user?.role || '').toLowerCase().trim();
      if (!data || !data.user || returnedRole !== selectedPortal) {
        await logout(false);
        setGeneralError('Your account does not have access to this portal.');
        return;
      }

      toast.success(`Welcome back, ${data.user.fullName || currentConfig.label}!`);

      // Role-based redirection
      if (returnedRole === 'student') {
        navigate(ROUTES.STUDENT_DASHBOARD || '/student', { replace: true });
      } else if (returnedRole === 'alumni') {
        navigate(ROUTES.ALUMNI_DASHBOARD || '/alumni', { replace: true });
      } else if (returnedRole === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD || '/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const message =
        err?.message || err?.response?.data?.message || 'Authentication failed. Please try again.';

      if (
        status === 403 ||
        message.toLowerCase().includes('denied') ||
        message.toLowerCase().includes('restricted') ||
        message.toLowerCase().includes('registered as') ||
        message.toLowerCase().includes('access to this portal')
      ) {
        setGeneralError(message || 'Your account does not have access to this portal.');
      } else if (status === 401) {
        setGeneralError('Invalid email or password. Please try again.');
      } else if (status === 500) {
        setGeneralError('Internal server error. Please try again later.');
      } else if (!navigator.onLine || message.toLowerCase().includes('network')) {
        setGeneralError('Network error. Please check your internet connection.');
      } else {
        setGeneralError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = PORTALS[selectedPortal];

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-[#CBD5E1]">
      {/* Left Branding Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0B1120] flex-col justify-between p-12 relative overflow-hidden text-white border-r border-[#26334D]">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/10 pointer-events-none blur-2xl" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-indigo-500/10 pointer-events-none blur-2xl" />

        {/* Brand */}
        <div className="relative z-10">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-soft-md group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
              Alumni<span className="text-[#818CF8]">Connect</span>
            </span>
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/15 text-white">
            <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure University Network</span>
          </div>
          <p className="mt-3 text-sm text-[#CBD5E1] max-w-sm leading-relaxed">
            The university networking platform bridging students with experienced alumni professionals.
          </p>
        </div>

        {/* Value Pillars */}
        <div className="relative z-10 space-y-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shadow-sm border border-white/10">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{title}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-[#64748B]">
          &copy; {new Date().getFullYear()} AlumniConnect &middot; University Networking Platform
        </p>
      </div>

      {/* Right Login Container Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-10 py-10 bg-[#0B1120]">
        {/* Mobile Brand Header */}
        <div className="lg:hidden mb-6 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-[#F8FAFC]">
              Alumni<span className="text-[#818CF8]">Connect</span>
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-[#151E32] rounded-3xl shadow-2xl border border-[#26334D] p-6 sm:p-9">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5">
              Choose your portal
            </p>
          </div>

          {/* Three Portals Selection Bar */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0B1120] rounded-2xl mb-6 border border-[#26334D]">
            {Object.values(PORTALS).map((portal) => {
              const isSelected = selectedPortal === portal.key;
              return (
                <button
                  key={portal.key}
                  type="button"
                  onClick={() => handlePortalSwitch(portal.key)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#6366F1] text-white shadow-soft-md border border-[#6366F1]'
                      : 'text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-[#151E32] border border-transparent'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm">{portal.emoji}</span>
                  <span>{portal.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Portal Form Title & Subtitle */}
          <div className="mb-5 pb-3 border-b border-[#26334D]">
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              {currentConfig.title}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {currentConfig.subtext}
            </p>
          </div>

          {/* Already logged in helper alert */}
          {isAuthenticated && user && (
            <div className="mb-5 p-3 rounded-xl bg-[#202B40] border border-indigo-500/40 text-xs text-indigo-300 flex items-start gap-2.5">
              <HiOutlineInformationCircle className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>
                  Currently signed in as <strong>{user.fullName}</strong> ({user.role}). Sign in below to switch accounts or{' '}
                  <Link
                    to={
                      user.role === 'admin'
                        ? '/admin'
                        : user.role === 'alumni'
                        ? '/alumni'
                        : '/student'
                    }
                    className="font-bold underline text-white hover:text-indigo-200"
                  >
                    go to dashboard
                  </Link>
                  .
                </span>
              </div>
            </div>
          )}

          {/* General Error Alert */}
          {generalError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs sm:text-sm text-rose-300 animate-fade-in">
              <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span>{generalError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label={currentConfig.emailLabel}
              id={`${selectedPortal}-email`}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={currentConfig.emailPlaceholder}
              icon={HiOutlineMail}
              error={formErrors.email}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                id={`${selectedPortal}-password`}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                icon={HiOutlineLockClosed}
                error={formErrors.password}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-[2.15rem] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="w-5 h-5" />
                ) : (
                  <HiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-[#334155] bg-[#202B40] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer"
                />
                <span className="text-[#94A3B8]">Remember me</span>
              </label>
              <span
                className="text-[#64748B] font-medium cursor-not-allowed text-xs"
                title="Password reset via admin or university support"
              >
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              icon={!isSubmitting ? HiArrowRight : undefined}
              className="w-full mt-2 font-semibold shadow-soft-md bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              {isSubmitting ? currentConfig.submittingText : currentConfig.submitText}
            </Button>
          </form>

          {/* Registration / Account Footer */}
          {currentConfig.showRegister ? (
            <div className="mt-6 pt-5 border-t border-[#26334D] text-center">
              <span className="text-xs text-[#94A3B8]">New to AlumniConnect? </span>
              <Link
                to={currentConfig.registerLink}
                className="text-xs font-bold text-[#818CF8] hover:text-white underline transition-colors"
              >
                {currentConfig.registerText}
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-[#26334D] text-center">
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                🛡 Restricted to authorized administrators. New administrator accounts cannot be created publicly.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-[#64748B] text-center">
          By signing in you agree to our{' '}
          <span className="text-[#94A3B8] font-medium">Terms of Service</span> and{' '}
          <span className="text-[#94A3B8] font-medium">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
