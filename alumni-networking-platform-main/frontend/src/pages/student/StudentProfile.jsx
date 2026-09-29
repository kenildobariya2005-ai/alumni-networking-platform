import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlinePencilAlt,
  HiOutlineExternalLink,
  HiOutlineCheckCircle,
  HiOutlineTrash,
} from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth.js';
import { studentService } from '../../services/studentService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    enrollmentNumber: '',
    branch: '',
    semester: '',
    graduationYear: '',
    bio: '',
    skills: '',
    interests: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [deletingResume, setDeletingResume] = useState(false);
  const resumeFileInputRef = useRef(null);

  // Load student profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyProfile();
      if (data?.profile) {
        const p = data.profile;
        setProfile(p);
        setFormData({
          fullName: p.user?.fullName || user?.fullName || '',
          enrollmentNumber: p.enrollmentNumber || '',
          branch: p.branch || '',
          semester: p.semester ? String(p.semester) : '',
          graduationYear: p.graduationYear ? String(p.graduationYear) : '',
          bio: p.bio || '',
          skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
          interests: Array.isArray(p.interests) ? p.interests.join(', ') : '',
          github: p.github || '',
          linkedin: p.linkedin || '',
          portfolio: p.portfolio || '',
        });
        if (p.user?.profilePicture) {
          setProfilePicturePreview(p.user.profilePicture);
        }
      }
    } catch (err) {
      if (err?.status !== 404) {
        toast.error('Failed to load profile details');
      } else {
        // First-time profile creation mode
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf =
        file.type === 'application/pdf' ||
        file.type === 'application/x-pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        toast.error('Only PDF files are allowed for resume');
        if (e.target) e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resume size must be under 5MB');
        if (e.target) e.target.value = '';
        return;
      }
      setResumeFile(file);
      setResumeUploadStatus('idle');
      setResumeUploadError('');
    }
  };

  // Direct resume upload handler
  const handleDirectResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a PDF resume');
      return;
    }

    try {
      setUploadingResume(true);
      setResumeUploadStatus('uploading');
      setResumeUploadError('');

      const fd = new FormData();
      fd.append('resume', resumeFile);
      const res = await studentService.uploadResume(fd);
      if (res?.profile) {
        setProfile(res.profile);
        setResumeUploadStatus('success');
        toast.success('Resume uploaded successfully!');
        setResumeFile(null);
        if (resumeFileInputRef.current) {
          resumeFileInputRef.current.value = '';
        }
      }
    } catch (err) {
      const errorMsg =
        err?.message ||
        (err?.code === 'ERR_NETWORK'
          ? 'Network error. Could not connect to the backend server.'
          : 'Failed to upload resume');
      setResumeUploadStatus('error');
      setResumeUploadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploadingResume(false);
    }
  };

  // Direct resume delete handler
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) {
      return;
    }

    try {
      setDeletingResume(true);
      const res = await studentService.deleteResume();
      if (res?.profile) {
        setProfile(res.profile);
      } else {
        setProfile((prev) => (prev ? { ...prev, resumeUrl: null, resumeFileId: null } : prev));
      }
      setResumeFile(null);
      if (resumeFileInputRef.current) {
        resumeFileInputRef.current.value = '';
      }
      toast.success('Resume removed successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove resume');
    } finally {
      setDeletingResume(false);
    }
  };

  // Profile Save handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.enrollmentNumber.trim()) {
      toast.error('Enrollment number is required');
      return;
    }
    if (!formData.branch.trim()) {
      toast.error('Branch is required');
      return;
    }
    if (!formData.semester || Number(formData.semester) < 1 || Number(formData.semester) > 8) {
      toast.error('Semester must be between 1 and 8');
      return;
    }
    if (!formData.graduationYear || Number(formData.graduationYear) < 2000) {
      toast.error('Please enter a valid graduation year');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('enrollmentNumber', formData.enrollmentNumber.trim());
      payload.append('branch', formData.branch.trim());
      payload.append('semester', formData.semester);
      payload.append('graduationYear', formData.graduationYear);
      payload.append('bio', formData.bio.trim());
      payload.append('skills', formData.skills);
      payload.append('interests', formData.interests);
      payload.append('github', formData.github.trim());
      payload.append('linkedin', formData.linkedin.trim());
      payload.append('portfolio', formData.portfolio.trim());

      if (profilePictureFile) {
        payload.append('profilePicture', profilePictureFile);
      }
      if (resumeFile) {
        payload.append('resume', resumeFile);
      }

      let res;
      if (profile) {
        res = await studentService.updateProfile(payload);
      } else {
        res = await studentService.createProfile(payload);
      }

      if (res?.profile) {
        setProfile(res.profile);
        if (res.profile.user?.profilePicture) {
          updateUser({ profilePicture: res.profile.user.profilePicture });
        }
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setResumeFile(null);
        setProfilePictureFile(null);
        if (resumeFileInputRef.current) {
          resumeFileInputRef.current.value = '';
        }
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
        <Loader size="lg" message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Profile Header Card */}
      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Upload */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#6366F1]/40 bg-[#202B40] flex items-center justify-center shadow-soft-sm">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt={user?.fullName || 'Student'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-[#818CF8]">
                  {user?.fullName?.charAt(0) || 'D'}
                </span>
              )}
            </div>

            {isEditing && (
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-[#0B1120]/80 rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-[#6366F1]/50"
              >
                <HiOutlineUpload className="w-6 h-6 text-[#818CF8]" />
                <span className="text-[10px] font-semibold mt-1 text-[#F8FAFC]">Upload Photo</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Basic Info */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                  {user?.fullName || 'Student'}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-medium mt-0.5">
                  {user?.email} &bull; <span className="capitalize font-semibold text-[#818CF8]">Student</span>
                </p>
              </div>

              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={HiOutlinePencilAlt}
                  onClick={() => setIsEditing(true)}
                  className="self-center sm:self-auto bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#2A3752] shadow-soft-sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {profile ? (
              <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                {profile.branch && (
                  <span className="px-3 py-1 rounded-xl bg-[#6366F1]/15 text-[#818CF8] font-semibold border border-[#6366F1]/30">
                    {profile.branch}
                  </span>
                )}
                {profile.semester && (
                  <span className="px-3 py-1 rounded-xl bg-[#202B40] text-[#CBD5E1] font-medium border border-[#334155]">
                    Semester {profile.semester}
                  </span>
                )}
                {profile.graduationYear && (
                  <span className="px-3 py-1 rounded-xl bg-[#202B40] text-[#CBD5E1] font-medium border border-[#334155]">
                    Batch of {profile.graduationYear}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium pt-2">
                Your profile is not yet created. Complete your details below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile View / Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#26334D] pb-4">
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-[#818CF8]" />
              Edit Student Details
            </h2>
            <button
              type="button"
              onClick={() => {
                if (profile) setIsEditing(false);
              }}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Enrollment Number"
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              placeholder="e.g. EN2024CS001"
              required
            />

            <Input
              label="Branch / Major"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g. Computer Science and Engineering"
              required
            />

            <Input
              label="Current Semester (1-8)"
              name="semester"
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g. 6"
              required
            />

            <Input
              label="Expected Graduation Year"
              name="graduationYear"
              type="number"
              min="2000"
              max="2035"
              value={formData.graduationYear}
              onChange={handleChange}
              placeholder="e.g. 2026"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
              Short Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell alumni and peers about your academic interests and career goals..."
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          {/* Skills & Interests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Technical Skills (comma-separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, TypeScript, Docker"
              helperText="Separate skills with commas"
            />

            <Input
              label="Interests & Hobbies (comma-separated)"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g. Open Source, Cloud Architecture, AI/ML"
              helperText="Separate interests with commas"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="GitHub Profile URL"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              icon={FaGithub}
            />

            <Input
              label="LinkedIn Profile URL"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              icon={FaLinkedin}
            />

            <Input
              label="Portfolio / Website URL"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.dev"
              icon={FaGlobe}
            />
          </div>

          {/* Resume Upload in Edit Mode */}
          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#334155]">
            <label className="block text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-1.5">
              {profile?.resumeFileId || profile?.resumeUrl ? 'Replace Resume (PDF format, max 5MB)' : 'Upload Resume (PDF format, max 5MB)'}
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeFileChange}
              className="block w-full text-xs text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#151E32] file:text-[#818CF8] file:border file:border-[#6366F1]/40 hover:file:bg-[#202B40] transition-colors cursor-pointer"
            />
            {resumeFile ? (
              <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
                <HiOutlineCheckCircle className="w-4 h-4" /> Selected: {resumeFile.name}
              </p>
            ) : (profile?.resumeFileId || profile?.resumeUrl) ? (
              <p className="text-xs text-[#94A3B8] font-medium mt-2 flex items-center gap-1">
                <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" /> Current resume attached. Choose a file above to replace it.
              </p>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26334D]">
            {profile && (
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-[#202B40] border-[#334155] text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#2A3752]"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              type="submit"
              isLoading={saving}
              className="shadow-soft-sm font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Save Profile
            </Button>
          </div>
        </form>
      ) : (
        /* Profile Read View */
        <div className="space-y-6">
          {/* Academic & Bio Card */}
          <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
            <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-[#818CF8]" />
              Academic Information & Bio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Enrollment No.
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.enrollmentNumber || 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Branch
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.branch || 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Semester
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.semester ? `Semester ${profile.semester}` : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Graduation Year
                </span>
                <span className="text-sm font-bold text-[#F8FAFC] mt-1 block">
                  {profile?.graduationYear || 'N/A'}
                </span>
              </div>
            </div>

            {profile?.bio && (
              <div>
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
                  About Me
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
                  Technical Skills
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

            {/* Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <div>
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-2">
                  Interests & Domains
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#202B40] text-[#CBD5E1] text-xs font-semibold border border-[#334155]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume & Social Links Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Section */}
            <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm space-y-4">
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5 text-[#818CF8]" />
                Resume / CV
              </h3>

              {(profile?.resumeFileId || profile?.resumeUrl) ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold border border-emerald-700/50">
                      <HiOutlineDocumentText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                        Resume Attached
                      </p>
                      <p className="text-[11px] text-emerald-300/80">
                        Ready for job & internship applications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={studentService.getResumeViewUrl(profile.resumeFileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-soft-sm"
                    >
                      View <HiOutlineExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      disabled={deletingResume}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete Resume"
                    >
                      {deletingResume ? (
                        'Removing...'
                      ) : (
                        <>
                          <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1">
                  <p className="font-semibold text-[#F8FAFC]">No resume uploaded yet</p>
                  <p className="text-amber-300/80">
                    Upload your PDF resume to easily apply to alumni job postings.
                  </p>
                </div>
              )}

              {/* Quick Resume Upload Form */}
              <div className="pt-2 space-y-3">
                <input
                  ref={resumeFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeFileChange}
                  className="block w-full text-xs text-[#94A3B8] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#202B40] file:text-[#CBD5E1] file:border file:border-[#334155] hover:file:bg-[#2A3752] transition-colors cursor-pointer"
                />

                {resumeUploadStatus === 'error' && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center justify-between gap-2">
                    <span className="truncate">{resumeUploadError || 'Upload failed'}</span>
                    {resumeFile && (
                      <button
                        type="button"
                        onClick={handleDirectResumeUpload}
                        disabled={uploadingResume}
                        className="text-xs font-bold underline hover:text-rose-200 text-rose-400 flex-shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                {resumeUploadStatus === 'success' && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 font-medium">
                    Upload successful!
                  </div>
                )}

                {resumeFile && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-[#CBD5E1] truncate max-w-[200px]" title={resumeFile.name}>
                      {resumeFile.name}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleDirectResumeUpload}
                      isLoading={uploadingResume}
                      className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    >
                      {uploadingResume
                        ? 'Uploading...'
                        : resumeUploadStatus === 'error'
                        ? 'Retry Upload'
                        : (profile?.resumeFileId || profile?.resumeUrl ? 'Replace Resume' : 'Upload Now')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm space-y-4">
              <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <FaGlobe className="w-5 h-5 text-[#818CF8]" />
                Social & Portfolio
              </h3>

              <div className="space-y-3">
                {profile?.github ? (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#202B40] border border-[#334155] hover:border-[#6366F1]/60 text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <FaGithub className="w-4 h-4 text-[#CBD5E1]" />
                      GitHub
                    </span>
                    <HiOutlineExternalLink className="w-4 h-4 text-[#94A3B8]" />
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#0B1120]/60 border border-[#26334D] text-xs text-[#94A3B8]">
                    GitHub not connected
                  </div>
                )}

                {profile?.linkedin ? (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#202B40] border border-[#334155] hover:border-[#6366F1]/60 text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <FaLinkedin className="w-4 h-4 text-[#38BDF8]" />
                      LinkedIn
                    </span>
                    <HiOutlineExternalLink className="w-4 h-4 text-[#94A3B8]" />
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#0B1120]/60 border border-[#26334D] text-xs text-[#94A3B8]">
                    LinkedIn not connected
                  </div>
                )}

                {profile?.portfolio ? (
                  <a
                    href={profile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#202B40] border border-[#334155] hover:border-[#6366F1]/60 text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <FaGlobe className="w-4 h-4 text-emerald-400" />
                      Portfolio
                    </span>
                    <HiOutlineExternalLink className="w-4 h-4 text-[#94A3B8]" />
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#0B1120]/60 border border-[#26334D] text-xs text-[#94A3B8]">
                    Portfolio not connected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
