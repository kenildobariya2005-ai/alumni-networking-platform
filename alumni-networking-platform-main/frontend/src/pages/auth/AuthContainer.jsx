import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiOutlineArrowLeft,
  HiArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

import useAuth from '../../hooks/useAuth.js';
import ROUTES, { getRoleRedirectPath } from '../../constants/routes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

// ==========================================
// Form Validation Helpers
// ==========================================
const validateLoginForm = ({ email, password, role }) => {
  const errors = {};
  const roleLabel = role === 'student' ? 'Student' : 'Alumni';

  if (!email.trim()) {
    errors.email = `${roleLabel} email address is required.`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

const validateRegisterForm = ({ fullName, email, password, confirmPassword, role }) => {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!role) {
    errors.role = 'Please select a role to continue.';
  } else if (!['student', 'alumni'].includes(role)) {
    errors.role = 'Invalid role selected.';
  }

  return errors;
};

// Password strength indicator
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
  return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
};

// ==========================================
// Value Pillars & Features Data
// ==========================================
const STUDENT_FEATURES = [
  {
    icon: HiOutlineAcademicCap,
    title: '1-on-1 Alumni Mentorship',
    desc: 'Connect with verified alumni mentors for career guidance and resume reviews.',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Verified Job & Internship ATS',
    desc: 'Apply directly to exclusive career opportunities posted by college graduates.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Collaborative Projects & AI Assistance',
    desc: 'Build real-world team projects and prepare with our built-in AI career assistant.',
  },
];

const ALUMNI_FEATURES = [
  {
    icon: HiOutlineUserGroup,
    title: 'Mentor the Next Generation',
    desc: 'Conduct 1-on-1 mentorship sessions and guide students on career roadmaps.',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Hire Campus Talent',
    desc: 'Post job and internship openings and manage candidate resumes directly.',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Lead Collaborative Projects',
    desc: 'Create technical initiatives and recruit motivated student contributors.',
  },
];

const REGISTER_BENEFITS = [
  { icon: HiOutlineUserGroup, text: 'Connect with 10,000+ alumni globally' },
  { icon: HiOutlineBriefcase, text: 'Access exclusive job and internship listings' },
  { icon: HiOutlineChatAlt2, text: 'Get matched with mentors in your field' },
  { icon: HiOutlineAcademicCap, text: 'Attend alumni-led workshops and events' },
];

// Role option selection card for Registration in dark theme
const RoleCard = ({ value, label, description, icon: Icon, selected, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onClick(value)}
    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
      selected
        ? 'border-primary-500 bg-primary-950/50 shadow-sm text-white'
        : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900 text-slate-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
        selected ? 'bg-primary-900/80 text-primary-300' : 'bg-slate-800 text-slate-400'
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-xs sm:text-sm font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>{label}</p>
      <p className={`text-[11px] mt-0.5 ${selected ? 'text-primary-300' : 'text-slate-400'}`}>{description}</p>
    </div>
    {selected && <HiOutlineCheckCircle className="flex-shrink-0 w-4 h-4 text-primary-400 mt-0.5" />}
  </button>
);

// ==========================================
// Main Animated Authentication Container
// ==========================================
export const AuthContainer = ({ initialMode = 'login', initialRole = 'student' }) => {
  const { login, register, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active state
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState(initialRole); // 'student' | 'alumni'

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  // Sync state if initial props or URL changes
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('register')) {
      setMode('register');
      if (path.includes('alumni')) {
        setRole('alumni');
        setRegisterData((prev) => ({ ...prev, role: 'alumni' }));
      } else {
        setRole('student');
        setRegisterData((prev) => ({ ...prev, role: 'student' }));
      }
    } else if (path.includes('alumni')) {
      setMode('login');
      setRole('alumni');
    } else if (path.includes('student')) {
      setMode('login');
      setRole('student');
    }
  }, [location.pathname]);


  // Show success toast from registration redirect
  useEffect(() => {
    const msg = location.state?.successMessage;
    if (msg) {
      toast.success(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mode switching with smooth history update
  const handleSwitchMode = (targetMode, targetRole = role) => {
    setMode(targetMode);
    if (targetRole) {
      setRole(targetRole);
      setRegisterData((prev) => ({ ...prev, role: targetRole }));
    }

    // Clear form errors on mode switch
    setLoginErrors({});
    setRegisterErrors({});

    // Smoothly update browser URL without full reload
    const targetUrl =
      targetMode === 'login'
        ? targetRole === 'alumni'
          ? ROUTES.ALUMNI_LOGIN
          : ROUTES.STUDENT_LOGIN
        : targetRole === 'alumni'
        ? '/alumni/register'
        : '/student/register';

    window.history.replaceState(null, '', targetUrl);
  };

  const handleRoleToggle = (newRole) => {
    setRole(newRole);
    setRegisterData((prev) => ({ ...prev, role: newRole }));
    setLoginErrors({});

    const targetUrl =
      mode === 'login'
        ? newRole === 'alumni'
          ? ROUTES.ALUMNI_LOGIN
          : ROUTES.STUDENT_LOGIN
        : newRole === 'alumni'
        ? '/alumni/register'
        : '/student/register';

    window.history.replaceState(null, '', targetUrl);
  };

  const handleBack = () => {
    navigate(ROUTES.LOGIN);
  };

  // Login Form Change & Submit
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name]) setLoginErrors((prev) => ({ ...prev, [name]: '' }));
    if (loginErrors.general) setLoginErrors((prev) => ({ ...prev, general: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm({ ...loginData, role });
    if (Object.keys(validationErrors).length > 0) {
      setLoginErrors(validationErrors);
      return;
    }

    setIsSubmittingLogin(true);
    setLoginErrors({});

    try {
      const data = await login({
        email: loginData.email.trim(),
        password: loginData.password,
        expectedRole: role,
      });

      if (data && data.user) {
        const welcomeRole = role === 'student' ? 'Student 🎓' : 'Alumni 💼';
        toast.success(`Welcome back, ${data.user.fullName || welcomeRole}!`);
        navigate(getRoleRedirectPath(data.user.role), { replace: true });
      } else {
        toast.error('Login succeeded but session data is missing. Please try again.');
      }
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const message =
        err?.message || err?.response?.data?.message || 'Login failed. Please try again.';

      if (status === 403) {
        setLoginErrors({ general: message });
      } else if (status === 401) {
        setLoginErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (status === 500) {
        setLoginErrors({ general: 'Server error. Please try again in a moment.' });
      } else if (!navigator.onLine || message.toLowerCase().includes('network')) {
        setLoginErrors({ general: 'Network error. Please check your internet connection.' });
      } else {
        setLoginErrors({ general: message });
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Register Form Change & Submit
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerErrors[name]) setRegisterErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRegisterRoleSelect = (selectedRole) => {
    setRegisterData((prev) => ({ ...prev, role: selectedRole }));
    setRole(selectedRole);
    if (registerErrors.role) setRegisterErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(registerData);
    if (Object.keys(validationErrors).length > 0) {
      setRegisterErrors(validationErrors);
      return;
    }

    setIsSubmittingRegister(true);
    setRegisterErrors({});

    const { confirmPassword, ...payload } = registerData;
    const submissionPayload = {
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      password: payload.password,
      role: payload.role,
    };

    try {
      const data = await register(submissionPayload);

      if (data && data.token && data.user) {
        toast.success(`Welcome to AlumniConnect, ${data.user.fullName}! 🎉`);
        navigate(getRoleRedirectPath(data.user.role), { replace: true });
      } else if (data && data.user) {
        handleSwitchMode('login', data.user.role || role);
        toast.success('Account created successfully! Please sign in.');
      } else {
        handleSwitchMode('login', role);
        toast.success('Account created! Please sign in to continue.');
      }
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const message = err?.message || 'Registration failed. Please try again.';

      if (status === 409 || message.toLowerCase().includes('already') || message.toLowerCase().includes('exists')) {
        setRegisterErrors({ email: 'An account with this email already exists.' });
      } else if (status === 400) {
        setRegisterErrors({ general: message });
      } else if (status === 500) {
        setRegisterErrors({ general: 'Server error. Please try again in a moment.' });
      } else if (!navigator.onLine || message.toLowerCase().includes('network')) {
        setRegisterErrors({ general: 'Network error. Please check your connection.' });
      } else {
        setRegisterErrors({ general: message });
      }
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const passwordStrength = getPasswordStrength(registerData.password);
  const isStudent = role === 'student';

  // Dynamic branding gradient based on active role in dark theme
  const brandingGradient = isStudent
    ? 'from-primary-700 via-indigo-800 to-slate-950'
    : 'from-indigo-800 via-primary-800 to-slate-950';

  const isLoginMode = mode === 'login';

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-[#CBD5E1] relative overflow-x-hidden flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* DESKTOP VIEW: Smooth Horizontal Sliding Overlay with Diagonal Boundary   */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full min-h-screen overflow-hidden">
        {/* Underlay Grid with Left & Right Form Slots */}
        <div className="absolute inset-0 w-full h-full flex">
          {/* 1. LEFT FORM SLOT (Registration Form - Revealed when Overlay slides Right) */}
          <div
            className={`w-1/2 h-full flex flex-col justify-center items-center px-10 xl:px-14 py-10 bg-[#0F172A] transition-all duration-700 ease-in-out ${
              !isLoginMode
                ? 'opacity-100 translate-x-0 pointer-events-auto z-10'
                : 'opacity-0 -translate-x-10 pointer-events-none z-0'
            }`}
          >
            <div className="w-full max-w-md bg-[#1E293B] rounded-3xl shadow-2xl shadow-black/60 border border-slate-800 px-8 py-8 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <div className="mb-4">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
                <p className="text-xs text-slate-400 mt-1">Join as a Student or Alumni</p>
              </div>

              {registerErrors.general && (
                <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 animate-fade-in">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                  </svg>
                  <span>{registerErrors.general}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                <Input
                  label="Full Name"
                  id="regFullName"
                  name="fullName"
                  type="text"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  placeholder="e.g. Priya Sharma"
                  icon={HiOutlineUser}
                  error={registerErrors.fullName}
                  required
                  disabled={isSubmittingRegister}
                  autoComplete="name"
                />

                <Input
                  label="Email Address"
                  id="regEmail"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="you@university.edu"
                  icon={HiOutlineMail}
                  error={registerErrors.email}
                  required
                  disabled={isSubmittingRegister}
                  autoComplete="email"
                />

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      label="Password"
                      id="regPassword"
                      name="password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Min. 8 characters"
                      icon={HiOutlineLockClosed}
                      error={registerErrors.password}
                      required
                      disabled={isSubmittingRegister}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      className="absolute right-3.5 top-[2.15rem] text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                      {showRegisterPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                  </div>

                  {registerData.password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Password strength:{' '}
                        <span
                          className={`font-semibold ${
                            passwordStrength.level <= 1
                              ? 'text-rose-400'
                              : passwordStrength.level === 2
                              ? 'text-amber-400'
                              : passwordStrength.level === 3
                              ? 'text-blue-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    id="regConfirmPassword"
                    name="confirmPassword"
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Re-enter your password"
                    icon={HiOutlineLockClosed}
                    error={registerErrors.confirmPassword}
                    required
                    disabled={isSubmittingRegister}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showRegisterConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-[2.15rem] text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showRegisterConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    I am joining as <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <RoleCard
                      value="student"
                      label="Student"
                      description="Enrolled learner"
                      icon={HiOutlineAcademicCap}
                      selected={registerData.role === 'student'}
                      disabled={isSubmittingRegister}
                      onClick={handleRegisterRoleSelect}
                    />
                    <RoleCard
                      value="alumni"
                      label="Alumni"
                      description="Graduated mentor"
                      icon={HiOutlineUserGroup}
                      selected={registerData.role === 'alumni'}
                      disabled={isSubmittingRegister}
                      onClick={handleRegisterRoleSelect}
                    />
                  </div>
                  {registerErrors.role && (
                    <p className="mt-1 text-xs text-rose-400 font-medium">{registerErrors.role}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingRegister}
                  disabled={isSubmittingRegister}
                  icon={!isSubmittingRegister ? HiArrowRight : undefined}
                  className="w-full mt-2 font-semibold shadow-soft-sm"
                >
                  {isSubmittingRegister ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>

              <div className="flex items-center gap-2 my-4">
                <span className="flex-1 h-px bg-slate-700/80" />
                <span className="text-[11px] text-slate-400 font-medium">Already have an account?</span>
                <span className="flex-1 h-px bg-slate-700/80" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchMode('login', 'student')}
                  className="w-full text-xs font-semibold text-slate-200 hover:text-primary-300 hover:border-primary-500"
                >
                  Student Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchMode('login', 'alumni')}
                  className="w-full text-xs font-semibold text-slate-200 hover:text-indigo-300 hover:border-indigo-500"
                >
                  Alumni Login
                </Button>
              </div>
            </div>
          </div>

          {/* 2. RIGHT FORM SLOT (Login Form - Revealed when Overlay is on Left) */}
          <div
            className={`w-1/2 h-full flex flex-col justify-center items-center px-10 xl:px-14 py-10 bg-[#0F172A] transition-all duration-700 ease-in-out ${
              isLoginMode
                ? 'opacity-100 translate-x-0 pointer-events-auto z-10'
                : 'opacity-0 translate-x-10 pointer-events-none z-0'
            }`}
          >
            <div className="w-full max-w-md bg-[#1E293B] rounded-3xl shadow-2xl shadow-black/60 border border-slate-800 px-8 py-9">
              {/* Header with Back Button */}
              <div className="flex items-start gap-3 sm:gap-4 mb-5">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0 mt-0.5"
                  title="Back to login portal selection"
                >
                  <HiOutlineArrowLeft className={`w-4 h-4 ${isStudent ? 'text-primary-400' : 'text-indigo-400'}`} />
                  <span>Back</span>
                </button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>{isStudent ? '🎓' : '👥'}</span>
                    <span
                      className={`bg-gradient-to-r ${
                        isStudent
                          ? 'from-primary-400 via-indigo-300 to-primary-200'
                          : 'from-indigo-400 via-primary-300 to-indigo-200'
                      } bg-clip-text text-transparent`}
                    >
                      {isStudent ? 'Student Login' : 'Alumni Login'}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {isStudent ? 'Sign in to your student account' : 'Sign in to your alumni account'}
                  </p>
                </div>
              </div>

              {/* Portal Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/80 rounded-2xl mb-5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('student')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    isStudent
                      ? 'bg-[#1E293B] text-primary-300 shadow-soft-sm border border-slate-700 cursor-default'
                      : 'text-slate-400 hover:text-primary-300 hover:bg-slate-800/80'
                  }`}
                >
                  <HiOutlineAcademicCap className={`w-4 h-4 ${isStudent ? 'text-primary-400' : 'text-slate-500'}`} />
                  <span>Student Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('alumni')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    !isStudent
                      ? 'bg-[#1E293B] text-indigo-300 shadow-soft-sm border border-slate-700 cursor-default'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80'
                  }`}
                >
                  <HiOutlineUserGroup className={`w-4 h-4 ${!isStudent ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>Alumni Portal</span>
                </button>
              </div>

              {loginErrors.general && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs sm:text-sm text-rose-300 animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                  </svg>
                  <div className="flex-1">
                    <span>{loginErrors.general}</span>
                    {loginErrors.general.includes(isStudent ? 'Alumni' : 'Student') && (
                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(isStudent ? 'alumni' : 'student')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300 underline"
                        >
                          Go to {isStudent ? 'Alumni' : 'Student'} Login <HiArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                <Input
                  label={isStudent ? 'Student Email Address' : 'Alumni Email Address'}
                  id="loginEmail"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder={isStudent ? 'student@university.edu' : 'alumni@company.com or university email'}
                  icon={HiOutlineMail}
                  error={loginErrors.email}
                  required
                  disabled={isSubmittingLogin}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    id="loginPassword"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    icon={HiOutlineLockClosed}
                    error={loginErrors.password}
                    required
                    disabled={isSubmittingLogin}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3.5 top-[2.15rem] text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showLoginPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isSubmittingLogin}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-slate-300">Remember me</span>
                  </label>
                  <span
                    className="text-slate-500 font-medium cursor-not-allowed text-xs"
                    title="Password reset via admin or university support"
                  >
                    Forgot password?
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmittingLogin}
                  disabled={isSubmittingLogin}
                  icon={!isSubmittingLogin ? HiArrowRight : undefined}
                  className={`w-full mt-2 font-semibold shadow-soft-md ${
                    !isStudent ? 'bg-indigo-600 hover:bg-indigo-500' : ''
                  }`}
                >
                  {isSubmittingLogin
                    ? isStudent
                      ? 'Signing in as Student…'
                      : 'Signing in as Alumni…'
                    : isStudent
                    ? 'Sign In as Student'
                    : 'Sign In as Alumni'}
                </Button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-slate-700/80" />
                <span className="text-xs text-slate-400 font-medium">New to AlumniConnect?</span>
                <span className="flex-1 h-px bg-slate-700/80" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSwitchMode('register', role)}
                className={`w-full font-semibold text-slate-200 hover:text-white ${
                  isStudent
                    ? 'hover:border-primary-500 hover:bg-slate-800'
                    : 'hover:border-indigo-500 hover:bg-slate-800'
                }`}
              >
                Create an Account
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SLIDING OVERLAY PANEL WITH DIAGONAL VISUAL BOUNDARY                       */}
        {/* ========================================================================= */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-1/2 h-full z-20 pointer-events-auto bg-gradient-to-br ${brandingGradient} text-white transition-all duration-700 ease-in-out shadow-2xl flex flex-col justify-between py-10 xl:py-12 overflow-hidden border-r border-indigo-500/20 box-border ${
            isLoginMode
              ? 'px-10 xl:px-14'
              : 'pl-16 xl:pl-24 pr-8 xl:pr-12'
          }`}
          style={{
            transform: isLoginMode ? 'translateX(0%)' : 'translateX(100%)',
            clipPath: isLoginMode
              ? 'polygon(0 0, 100% 0, 92% 100%, 0 100%)'
              : 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          {/* Ambient Glowing Orbs inside Sliding Panel */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-soft-md group-hover:bg-white/30 transition">
                <HiOutlineAcademicCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Alumni<span className="text-indigo-200">Connect</span>
              </span>
            </Link>
          </div>

          {/* Center Dynamic Content */}
          <div className="relative z-10 my-auto py-6 w-full max-w-lg">
            {isLoginMode ? (
              /* LOGIN MODE BRANDING */
              <div className="space-y-6 animate-fade-in transition-all duration-500">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-white mb-3">
                    <span>{isStudent ? '🎓 Student Portal' : '💼 Alumni & Recruiter Portal'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {isStudent ? 'Learn, connect and grow' : 'Mentor, hire and give back'}
                  </h2>
                  <p className="mt-2.5 text-xs sm:text-sm text-primary-100 max-w-sm leading-relaxed">
                    {isStudent
                      ? 'Bridge your academic journey with industry guidance from verified alumni.'
                      : 'Shape future talent, recruit top graduates, and strengthen your university network.'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {(isStudent ? STUDENT_FEATURES : ALUMNI_FEATURES).map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-primary-200 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register', role)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold tracking-wide transition-all shadow-soft-sm backdrop-blur-sm group"
                  >
                    <span>Need an account? Register now</span>
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              /* REGISTER MODE BRANDING */
              <div className="space-y-6 animate-fade-in transition-all duration-500">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-white mb-3">
                    <span>✨ Join AlumniConnect</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Join the university<br />community today
                  </h2>
                  <p className="mt-2.5 text-xs sm:text-sm text-primary-100 max-w-sm leading-relaxed">
                    Connect with your alumni network, unlock career opportunities, and explore real-world collaborations.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {REGISTER_BENEFITS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs sm:text-sm text-primary-100">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login', role)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold tracking-wide transition-all shadow-soft-sm backdrop-blur-sm group"
                  >
                    <span>Already registered? Sign in</span>
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-primary-200">
            <span>&copy; {new Date().getFullYear()} AlumniConnect</span>
            <span>University Career Network</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET VIEW: Responsive Animated Mode Switcher                   */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col justify-center items-center px-4 sm:px-8 py-8 flex-1">
        {/* Mobile brand header */}
        <div className="mb-6 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white">
              Alumni<span className="text-primary-400">Connect</span>
            </span>
          </Link>
        </div>

        {/* Mobile Animated Card Container */}
        <div className="w-full max-w-md bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-800 px-6 sm:px-8 py-8 transition-all duration-500 ease-in-out">
          {isLoginMode ? (
            /* Mobile Login View */
            <div className="animate-fade-in space-y-4">
              <div className="flex items-start gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition shadow-soft-sm flex-shrink-0 mt-0.5"
                >
                  <HiOutlineArrowLeft className="w-4 h-4 text-primary-400" />
                  <span>Back</span>
                </button>
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5">
                    <span>{isStudent ? '🎓' : '👥'}</span>
                    <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
                      {isStudent ? 'Student Login' : 'Alumni Login'}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    {isStudent ? 'Sign in to your student account' : 'Sign in to your alumni account'}
                  </p>
                </div>
              </div>

              {/* Portal switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('student')}
                  className={`py-2 px-2.5 rounded-lg text-center transition ${
                    isStudent ? 'bg-[#1E293B] text-primary-300 shadow-sm font-bold border border-slate-700' : 'text-slate-400'
                  }`}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('alumni')}
                  className={`py-2 px-2.5 rounded-lg text-center transition ${
                    !isStudent ? 'bg-[#1E293B] text-indigo-300 shadow-sm font-bold border border-slate-700' : 'text-slate-400'
                  }`}
                >
                  Alumni Portal
                </button>
              </div>

              {loginErrors.general && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                  {loginErrors.general}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
                <Input
                  label={isStudent ? 'Student Email Address' : 'Alumni Email Address'}
                  id="mobLoginEmail"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder={isStudent ? 'student@university.edu' : 'alumni@company.com'}
                  icon={HiOutlineMail}
                  error={loginErrors.email}
                  required
                  disabled={isSubmittingLogin}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    id="mobLoginPassword"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    icon={HiOutlineLockClosed}
                    error={loginErrors.password}
                    required
                    disabled={isSubmittingLogin}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3.5 top-[2.15rem] text-slate-400"
                  >
                    {showLoginPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-primary-600"
                    />
                    <span className="text-slate-300">Remember me</span>
                  </label>
                  <span className="text-slate-500">Forgot password?</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingLogin}
                  disabled={isSubmittingLogin}
                  className="w-full font-semibold shadow-soft-sm"
                >
                  {isSubmittingLogin ? 'Signing in…' : `Sign In as ${isStudent ? 'Student' : 'Alumni'}`}
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register', role)}
                    className="font-bold text-primary-400 hover:text-primary-300 underline"
                  >
                    Create an Account
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* Mobile Register View */
            <div className="animate-fade-in space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-white">Create your account</h1>
                <p className="text-xs text-slate-400">Join as a Student or Alumni</p>
              </div>

              {registerErrors.general && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                  {registerErrors.general}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                <Input
                  label="Full Name"
                  id="mobRegName"
                  name="fullName"
                  type="text"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  placeholder="e.g. Priya Sharma"
                  icon={HiOutlineUser}
                  error={registerErrors.fullName}
                  required
                  disabled={isSubmittingRegister}
                />

                <Input
                  label="Email Address"
                  id="mobRegEmail"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="you@university.edu"
                  icon={HiOutlineMail}
                  error={registerErrors.email}
                  required
                  disabled={isSubmittingRegister}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    id="mobRegPassword"
                    name="password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Min. 8 characters"
                    icon={HiOutlineLockClosed}
                    error={registerErrors.password}
                    required
                    disabled={isSubmittingRegister}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegisterPassword((v) => !v)}
                    className="absolute right-3.5 top-[2.15rem] text-slate-400"
                  >
                    {showRegisterPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    id="mobRegConfirmPassword"
                    name="confirmPassword"
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Re-enter password"
                    icon={HiOutlineLockClosed}
                    error={registerErrors.confirmPassword}
                    required
                    disabled={isSubmittingRegister}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-[2.15rem] text-slate-400"
                  >
                    {showRegisterConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Role <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegisterRoleSelect('student')}
                      className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition ${
                        registerData.role === 'student'
                          ? 'border-primary-500 bg-primary-950/50 text-primary-300'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegisterRoleSelect('alumni')}
                      className={`p-2.5 rounded-xl border-2 text-xs font-bold text-center transition ${
                        registerData.role === 'alumni'
                          ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      💼 Alumni
                    </button>
                  </div>
                  {registerErrors.role && (
                    <p className="mt-1 text-xs text-rose-400">{registerErrors.role}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingRegister}
                  disabled={isSubmittingRegister}
                  className="w-full font-semibold shadow-soft-sm mt-1"
                >
                  {isSubmittingRegister ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login', role)}
                    className="font-bold text-primary-400 hover:text-primary-300 underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center max-w-xs">
          By continuing you agree to our{' '}
          <span className="text-slate-400 font-medium">Terms of Service</span> and{' '}
          <span className="text-slate-400 font-medium">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;
