import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineBadgeCheck,
  HiOutlineExternalLink,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserById(id);
      if (data?.data) {
        setUserData(data.data.user || null);
        setProfileData(data.data.profile || null);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load user details');
      navigate(ROUTES.ADMIN_USERS);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleToggleStatus = async () => {
    if (!userData) return;
    try {
      setActionLoading(true);
      const newStatus = !userData.isActive;
      await adminService.updateUserStatus(userData._id, newStatus);
      toast.success(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      setUserData((prev) => ({ ...prev, isActive: newStatus }));
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!userData || userData.role !== 'alumni') return;
    try {
      setActionLoading(true);
      if (userData.isVerified) {
        await adminService.unverifyAlumni(userData._id);
        toast.success('Alumni verification removed');
        setUserData((prev) => ({ ...prev, isVerified: false }));
      } else {
        await adminService.verifyAlumni(userData._id);
        toast.success('Alumni verified successfully');
        setUserData((prev) => ({ ...prev, isVerified: true }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to toggle verification');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading user details..." />
      </div>
    );
  }

  if (!userData) return null;

  const isStudent = userData.role === 'student';
  const isAlumni = userData.role === 'alumni';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ADMIN_USERS)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Users List
      </button>

      {/* Basic User Account Card */}
      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#26334D]">
          <div className="flex items-center gap-4">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt={userData.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-[#26334D]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold text-xl flex items-center justify-center border border-[#6366F1]/30">
                {userData.fullName?.charAt(0) || 'U'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#F8FAFC]">
                  {userData.fullName}
                </h1>
                {userData.isVerified && isAlumni && (
                  <span className="text-[#818CF8]" title="Verified Alumni">
                    <HiOutlineBadgeCheck className="w-5 h-5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                  {userData.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    userData.isActive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Management Actions */}
          <div className="flex flex-wrap sm:flex-col sm:items-end gap-2">
            <Button
              variant={userData.isActive ? 'danger' : 'primary'}
              size="sm"
              disabled={actionLoading}
              onClick={handleToggleStatus}
              className={!userData.isActive ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white' : ''}
            >
              {userData.isActive ? 'Deactivate Account' : 'Reactivate Account'}
            </Button>

            {isAlumni && (
              <Button
                variant={userData.isVerified ? 'outline' : 'primary'}
                size="sm"
                icon={HiOutlineBadgeCheck}
                disabled={actionLoading}
                onClick={handleToggleVerification}
                className={userData.isVerified ? 'bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]' : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white'}
              >
                {userData.isVerified ? 'Remove Verification' : 'Verify Alumni'}
              </Button>
            )}
          </div>
        </div>

        {/* Account Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              User ID
            </span>
            <span className="text-xs font-bold text-[#F8FAFC] break-all">
              {userData._id}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Registered On
            </span>
            <span className="text-xs font-bold text-[#F8FAFC]">
              {new Date(userData.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Profile Status
            </span>
            <span className="text-xs font-bold text-[#F8FAFC]">
              {profileData ? 'Completed' : 'Pending Setup'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Last Updated
            </span>
            <span className="text-xs font-bold text-[#F8FAFC]">
              {new Date(userData.updatedAt || userData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Role-Specific Profile Information */}
      {profileData ? (
        <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            {isStudent ? (
              <HiOutlineAcademicCap className="w-5 h-5 text-[#818CF8]" />
            ) : (
              <HiOutlineBriefcase className="w-5 h-5 text-[#818CF8]" />
            )}
            {isStudent ? 'Student Academic Profile' : 'Alumni Professional Profile'}
          </h2>

          {isStudent && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Enrollment No.</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.enrollmentNumber || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Branch</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.branch || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Semester</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.semester || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Graduation Year</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.graduationYear || 'N/A'}</span>
              </div>
            </div>
          )}

          {isAlumni && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Company</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.company || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Designation</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.designation || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Experience</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.experienceYears} Years</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block font-semibold">Location</span>
                <span className="text-sm font-bold text-[#F8FAFC]">{profileData.location || 'N/A'}</span>
              </div>
            </div>
          )}

          {profileData.bio && (
            <div>
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                Bio / Summary
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] bg-[#202B40] p-4 rounded-2xl border border-[#26334D] leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}

          {profileData.skills && profileData.skills.length > 0 && (
            <div>
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-2">
                Registered Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profileData.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profileData.resumeUrl && (
            <div className="pt-2">
              <a
                href={profileData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-soft-sm"
              >
                <HiOutlineDocumentText className="w-4 h-4" />
                View Student Resume (PDF) <HiOutlineExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] text-center text-xs text-[#94A3B8]">
          User has not created an extended profile yet.
        </div>
      )}
    </div>
  );
};

export default UserDetails;
