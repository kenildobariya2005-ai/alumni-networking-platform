import React, { useState, useEffect } from 'react';
import {
  HiOutlineCog,
  HiOutlineAcademicCap,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { alumniService } from '../../services/alumniService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';

export const AlumniSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentorAvailable, setMentorAvailable] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnMentorshipRequest: true,
    emailOnJobApplication: true,
    emailOnDirectMessage: true,
    weeklyCommunityDigest: false,
    displayCompanyInDirectory: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await alumniService.getMyProfile();
        if (data && data.profile) {
          setMentorAvailable(!!data.profile.mentorAvailable);
        }
      } catch (err) {
        console.warn('Could not load profile settings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleToggleNotification = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Update mentor availability via alumniService
      await alumniService.updateProfile({ mentorAvailable });
      toast.success('Alumni preferences saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="md" message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Header */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 border border-[#26334D] shadow-lg">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 mb-2">
          <HiOutlineCog className="w-4 h-4 text-emerald-400" /> Account Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
          Alumni Settings
        </h1>
        <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">
          Control your mentorship availability, alert preferences, and directory visibility.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Mentorship Availability Setting */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineAcademicCap className="w-5 h-5 text-purple-400" />
            1-on-1 Mentorship Availability
          </h2>
          <p className="text-xs text-[#94A3B8]">
            When enabled, students can view your mentor profile and submit mentorship inquiries.
          </p>

          <label className="flex items-center justify-between p-4 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
            <div>
              <span className="text-sm font-semibold text-[#F8FAFC] block">
                Available to Mentor Students
              </span>
              <span className="text-xs text-[#94A3B8]">
                {mentorAvailable
                  ? 'Your profile is currently accepting incoming student requests.'
                  : 'You are currently not accepting new student mentorship inquiries.'}
              </span>
            </div>

            <input
              type="checkbox"
              checked={mentorAvailable}
              onChange={(e) => setMentorAvailable(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineBell className="w-5 h-5 text-indigo-400" />
            Communication & Alert Preferences
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <div>
                <span className="font-semibold text-[#F8FAFC] block">New Mentorship Request Alerts</span>
                <span className="text-[#94A3B8]">Receive instant notifications when students request a session.</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailOnMentorshipRequest}
                onChange={() => handleToggleNotification('emailOnMentorshipRequest')}
                className="w-4 h-4 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <div>
                <span className="font-semibold text-[#F8FAFC] block">Job Application Notifications</span>
                <span className="text-[#94A3B8]">Notify me when a student applies to my posted jobs or internships.</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailOnJobApplication}
                onChange={() => handleToggleNotification('emailOnJobApplication')}
                className="w-4 h-4 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors">
              <div>
                <span className="font-semibold text-[#F8FAFC] block">Direct Message Alerts</span>
                <span className="text-[#94A3B8]">Get alerted for new incoming chat messages.</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailOnDirectMessage}
                onChange={() => handleToggleNotification('emailOnDirectMessage')}
                className="w-4 h-4 rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
              />
            </label>
          </div>
        </div>

        {/* Directory Visibility */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineShieldCheck className="w-5 h-5 text-emerald-400" />
            Network Directory Privacy
          </h2>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer hover:border-[#334155] transition-colors text-xs">
            <div>
              <span className="font-semibold text-[#F8FAFC] block">Display Company in Alumni Directory</span>
              <span className="text-[#94A3B8]">Show your current employer and designation to other alumni.</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.displayCompanyInDirectory}
              onChange={() => handleToggleNotification('displayCompanyInDirectory')}
              className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={HiOutlineCheck}
            disabled={saving}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold px-6 py-2.5 shadow-soft-sm"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AlumniSettings;
