import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineExternalLink,
  HiOutlineBriefcase,
} from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const AlumniVerification = () => {
  const [loading, setLoading] = useState(true);
  const [alumniList, setAlumniList] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('false'); // default to pending
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [confirmVerifyAlumni, setConfirmVerifyAlumni] = useState(null);
  const [confirmUnverifyAlumni, setConfirmUnverifyAlumni] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAlumni = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          role: 'alumni',
          search: search.trim() || undefined,
          isVerified: verificationFilter !== '' ? verificationFilter : undefined,
          sort: '-createdAt',
        };

        const data = await adminService.getUsers(params);
        if (data?.data) {
          setAlumniList(data.data.users || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalUsers || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch alumni');
      } finally {
        setLoading(false);
      }
    },
    [verificationFilter, search, pagination.limit]
  );

  useEffect(() => {
    fetchAlumni(1);
  }, [verificationFilter]);

  const handleVerify = async () => {
    if (!confirmVerifyAlumni) return;
    try {
      setSubmittingAction(true);
      await adminService.verifyAlumni(confirmVerifyAlumni._id);
      toast.success(`${confirmVerifyAlumni.fullName} verified successfully!`);
      setConfirmVerifyAlumni(null);
      fetchAlumni(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to verify alumni');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUnverify = async () => {
    if (!confirmUnverifyAlumni) return;
    try {
      setSubmittingAction(true);
      await adminService.unverifyAlumni(confirmUnverifyAlumni._id);
      toast.success(`Verification removed for ${confirmUnverifyAlumni.fullName}`);
      setConfirmUnverifyAlumni(null);
      fetchAlumni(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to unverify alumni');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Trust & Security Moderation
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Alumni Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Review alumni registration credentials, verify institutional affiliation, and grant mentor privileges.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#202B40] rounded-2xl border border-[#26334D] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setVerificationFilter('false')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              verificationFilter === 'false'
                ? 'bg-[#6366F1] text-white shadow-soft-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Pending Verification
          </button>
          <button
            type="button"
            onClick={() => setVerificationFilter('true')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              verificationFilter === 'true'
                ? 'bg-[#6366F1] text-white shadow-soft-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Verified Alumni
          </button>
          <button
            type="button"
            onClick={() => setVerificationFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              verificationFilter === ''
                ? 'bg-[#6366F1] text-white shadow-soft-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Alumni Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading alumni verification records..." />
        </div>
      ) : alumniList.length === 0 ? (
        <EmptyState
          icon={HiOutlineShieldCheck}
          title="No alumni found"
          description={`No alumni found in "${
            verificationFilter === 'false'
              ? 'Pending Verification'
              : verificationFilter === 'true'
              ? 'Verified'
              : 'All'
          }" status.`}
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Alumni Profile</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {alumniList.map((alumni) => (
                  <tr key={alumni._id} className="hover:bg-[#202B40]/50 transition-colors">
                    {/* Alumni info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {alumni.profilePicture ? (
                          <img
                            src={alumni.profilePicture}
                            alt={alumni.fullName}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#26334D]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-sm border border-[#6366F1]/30">
                            {alumni.fullName?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                            {alumni.fullName}
                            {alumni.isVerified && (
                              <HiOutlineBadgeCheck className="w-4 h-4 text-[#818CF8]" />
                            )}
                          </p>
                          <p className="text-xs text-[#94A3B8]">{alumni.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {alumni.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          <HiOutlineBadgeCheck className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-[#94A3B8]">
                      {new Date(alumni.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {alumni.isVerified ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setConfirmUnverifyAlumni(alumni)}
                        >
                          Revoke Verification
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={HiOutlineBadgeCheck}
                          onClick={() => setConfirmVerifyAlumni(alumni)}
                          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                        >
                          Approve & Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 border-t border-[#26334D]">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => fetchAlumni(p)}
            />
          </div>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={!!confirmVerifyAlumni}
        onClose={() => setConfirmVerifyAlumni(null)}
        title="Confirm Alumni Verification"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to verify <span className="font-bold text-[#F8FAFC]">{confirmVerifyAlumni?.fullName}</span>? They will receive a verified badge and will be eligible to post jobs and mentor students.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmVerifyAlumni(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submittingAction}
              onClick={handleVerify}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Verify Alumni
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unverify Confirmation Modal */}
      <Modal
        isOpen={!!confirmUnverifyAlumni}
        onClose={() => setConfirmUnverifyAlumni(null)}
        title="Revoke Alumni Verification"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to remove verification status from <span className="font-bold text-[#F8FAFC]">{confirmUnverifyAlumni?.fullName}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmUnverifyAlumni(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={submittingAction}
              onClick={handleUnverify}
            >
              Revoke Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlumniVerification;
