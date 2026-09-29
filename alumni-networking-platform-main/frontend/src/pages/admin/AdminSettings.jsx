import React, { useState } from 'react';
import {
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'AlumniConnect',
    universityName: 'Engineering & Technology University',
    supportEmail: 'admin@alumniconnect.com',
    requireAlumniVerificationForJobs: true,
    requireAlumniVerificationForProjects: true,
    autoModeratePosts: true,
    allowStudentRegistration: true,
    notifyAdminOnNewAlumni: true,
    notifyAdminOnFlaggedContent: true,
    sessionTimeoutHours: '168',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform administration settings saved successfully!');
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Header */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 border border-[#334155] shadow-lg">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/40 uppercase tracking-wider mb-2">
          <HiOutlineCog className="w-4 h-4 text-emerald-400" /> Platform Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
          System Settings & Platform Rules
        </h1>
        <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">
          Configure global platform settings, access gates, alumni verification requirements, and moderation thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity Settings */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineShieldCheck className="w-5 h-5 text-indigo-400" />
            General Platform Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#202B40] border border-[#26334D] text-[#F8FAFC] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                University / Institution Name
              </label>
              <input
                type="text"
                name="universityName"
                value={settings.universityName}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#202B40] border border-[#26334D] text-[#F8FAFC] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Admin Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#202B40] border border-[#26334D] text-[#F8FAFC] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>
        </div>

        {/* Verification & Access Control Rules */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineLockClosed className="w-5 h-5 text-emerald-400" />
            Access Gates & Verification Rules
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <input
                type="checkbox"
                name="requireAlumniVerificationForJobs"
                checked={settings.requireAlumniVerificationForJobs}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Require Alumni Verification for Job Postings
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Prevents unverified alumni from creating public job or internship openings until admin approval.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <input
                type="checkbox"
                name="requireAlumniVerificationForProjects"
                checked={settings.requireAlumniVerificationForProjects}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Require Verification for Collaborative Projects
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Only verified alumni and verified users can initiate open team recruitment.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <input
                type="checkbox"
                name="allowStudentRegistration"
                checked={settings.allowStudentRegistration}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Allow Open Student Registration
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Permit students with institutional emails to register directly from portal.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications & Admin Alerts */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineBell className="w-5 h-5 text-amber-400" />
            Administrative Alerts
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <input
                type="checkbox"
                name="notifyAdminOnNewAlumni"
                checked={settings.notifyAdminOnNewAlumni}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Alert on New Alumni Registration
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Generates an admin alert whenever an alumni signs up and submits company credentials.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <input
                type="checkbox"
                name="notifyAdminOnFlaggedContent"
                checked={settings.notifyAdminOnFlaggedContent}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Alert on Community Content Flagged
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Sends high-priority notification to admin queue when posts or comments are hidden.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={HiOutlineCheck}
            disabled={saving}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold px-6 py-2.5"
          >
            {saving ? 'Saving...' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
