import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlinePencilAlt,
  HiOutlineUpload,
  HiOutlineExternalLink,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth.js';
import { alumniService } from '../../services/alumniService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';

export const AlumniProfile = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    company: '',
    designation: '',
    experienceYears: '',
    location: '',
    bio: '',
    skills: '',
    linkedin: '',
    mentorAvailable: true,
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');

  // Fetch Alumni Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await alumniService.getMyProfile();
      if (data?.profile) {
        const p = data.profile;
        setProfile(p);
        setFormData({
          fullName: p.user?.fullName || user?.fullName || '',
          company: p.company || '',
          designation: p.designation || '',
          experienceYears: p.experienceYears !== undefined ? String(p.experienceYears) : '',
          location: p.location || '',
          bio: p.bio || '',
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
          linkedin: p.linkedin || '',
          mentorAvailable: p.mentorAvailable ?? true,
        });
        if (p.user?.profilePicture) {
          setProfilePicturePreview(p.user.profilePicture);
        }
      }
    } catch (err) {
      if (err?.status !== 404) {
        toast.error('Failed to load alumni profile');
      } else {
        setIsEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company.trim()) {
      toast.error('Company is required');
      return;
    }
    if (!formData.designation.trim()) {
      toast.error('Designation is required');
      return;
    }
    if (formData.experienceYears === '' || Number(formData.experienceYears) < 0) {
      toast.error('Please enter valid years of experience');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('company', formData.company.trim());
      payload.append('designation', formData.designation.trim());
      payload.append('experienceYears', formData.experienceYears);
      payload.append('location', formData.location.trim());
      payload.append('bio', formData.bio.trim());
      payload.append('skills', formData.skills);
      payload.append('linkedin', formData.linkedin.trim());
      payload.append('mentorAvailable', String(formData.mentorAvailable));

      if (profilePictureFile) {
        payload.append('profilePicture', profilePictureFile);
      }

      let res;
      if (profile) {
        res = await alumniService.updateProfile(payload);
      } else {
        res = await alumniService.createProfile(payload);
      }

      if (res?.profile) {
        setProfile(res.profile);
        if (res.profile.user?.profilePicture) {
          updateUser({ profilePicture: res.profile.user.profilePicture });
        }
        toast.success('Alumni profile updated successfully!');
        setIsEditing(false);
        setProfilePictureFile(null);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading alumni profile..." />
      </div>
    );
  }

  const isVerified = profile?.isVerified || user?.isVerified;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Profile Header Card */}
      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Upload */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#6366F1]/30 bg-[#202B40] flex items-center justify-center shadow-soft-sm">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt={user?.fullName || 'Alumni'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-[#818CF8]">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              )}
            </div>

            {isEditing && (
              <label
                htmlFor="alumni-avatar-upload"
                className="absolute inset-0 bg-[#0B1120]/80 rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-[#6366F1]/40"
              >
                <HiOutlineUpload className="w-6 h-6 text-[#818CF8]" />
                <span className="text-[10px] font-semibold mt-1 text-[#CBD5E1]">Change Photo</span>
                <input
                  id="alumni-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Alumni Basic Info */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                    {user?.fullName || 'Alumni'}
                  </h1>
                  {isVerified && (
                    <span className="text-[#6366F1]" title="Verified Alumni">
                      <HiOutlineBadgeCheck className="w-5 h-5" />
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-medium mt-0.5">
                  {user?.email} &bull; <span className="capitalize font-semibold text-[#818CF8]">Verified Alumni</span>
                </p>
              </div>

              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={HiOutlinePencilAlt}
                  onClick={() => setIsEditing(true)}
                  className="self-center sm:self-auto bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC] shadow-soft-sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {profile ? (
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                {profile.designation && (
                  <span className="px-3 py-1 rounded-xl bg-[#6366F1]/15 text-[#818CF8] font-semibold border border-[#6366F1]/30">
                    {profile.designation}
                  </span>
                )}
                {profile.company && (
                  <span className="px-3 py-1 rounded-xl bg-[#202B40] text-[#CBD5E1] font-medium border border-[#26334D]">
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="px-3 py-1 rounded-xl bg-[#202B40] text-[#CBD5E1] font-medium border border-[#26334D]">
                    {profile.location}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-xl font-semibold border ${
                    profile.mentorAvailable
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                      : 'bg-[#202B40] text-[#94A3B8] border-[#334155]'
                  }`}
                >
                  {profile.mentorAvailable ? 'Available for Mentoring' : 'Mentoring Off'}
                </span>
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium pt-2">
                Your alumni profile is not yet completed. Fill out the details below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form or Read View */}
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#26334D] pb-4">
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-[#818CF8]" />
              Edit Alumni Profile
            </h2>
            {profile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Current Company / Organization"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft, Startup Inc."
              required
            />

            <Input
              label="Job Title / Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              required
            />

            <Input
              label="Years of Experience"
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="e.g. 5"
              required
            />

            <Input
              label="Location (City, Country)"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India / San Francisco, CA"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
              Professional Bio & Career Journey
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Share your industry journey, expertise domains, and how you can guide students..."
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 leading-relaxed"
            />
          </div>

          {/* Skills & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Mentorship Skills & Domains"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. System Design, Cloud, Career Switch, React"
              helperText="Separate skills with commas"
            />

            <Input
              label="LinkedIn Profile URL"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              icon={FaLinkedin}
            />
          </div>

          {/* Mentorship Availability Toggle */}
          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#F8FAFC]">
                Mentorship Availability
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Allow verified students to book 1-on-1 career guidance sessions with you.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="mentorAvailable"
                checked={formData.mentorAvailable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#202B40] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26334D]">
            {profile && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-[#202B40] border-[#334155] text-[#CBD5E1] hover:text-[#F8FAFC] hover:border-[#6366F1]"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              type="submit"
              isLoading={saving}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold shadow-soft-sm"
            >
              Save Alumni Profile
            </Button>
          </div>
        </form>
      ) : (
        /* Read View */
        <div className="space-y-6">
          <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
            <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-[#818CF8]" />
              Professional Experience & Skills
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Company
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.company || 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Designation
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.designation || 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Experience
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.experienceYears !== undefined ? `${profile.experienceYears} Years` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Location
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.location || 'N/A'}
                </span>
              </div>
            </div>

            {profile?.bio && (
              <div>
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
                  About
                </span>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed bg-[#202B40] p-4 rounded-2xl border border-[#26334D]">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-2">
                  Domains & Mentoring Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#6366F1]/15 text-[#818CF8] text-xs font-semibold border border-[#6366F1]/30 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Link */}
            {profile?.linkedin && (
              <div className="pt-2">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-950/60 text-sky-300 text-xs font-bold hover:bg-sky-900/70 transition-colors border border-sky-800/50"
                >
                  <FaLinkedin className="w-4 h-4 text-sky-400" />
                  View LinkedIn Profile
                  <HiOutlineExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;

