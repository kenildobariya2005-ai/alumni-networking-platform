import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineBadgeCheck,
  HiOutlineShieldCheck,
  HiOutlineX,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const UserManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  // Filters from query or state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [isActive, setIsActive] = useState('');
  const [isVerified, setIsVerified] = useState('');

  // Delete User Modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status toggle in-flight ID
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          role: role || undefined,
          isActive: isActive !== '' ? isActive : undefined,
          isVerified: isVerified !== '' ? isVerified : undefined,
          sort: '-createdAt',
        };

        const data = await adminService.getUsers(params);
        if (data?.data) {
          setUsers(data.data.users || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalUsers || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    },
    [search, role, isActive, isVerified, pagination.limit]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [role, isActive, isVerified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('');
    setIsActive('');
    setIsVerified('');
    setSearchParams({});
  };

  const handleToggleStatus = async (userObj) => {
    try {
      setUpdatingId(userObj._id);
      const newStatus = !userObj.isActive;
      await adminService.updateUserStatus(userObj._id, newStatus);
      toast.success(`User marked as ${newStatus ? 'Active' : 'Inactive'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userObj._id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteUser(userToDelete._id);
      toast.success('User account deactivated / soft-deleted');
      setUserToDelete(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Identity & Access Management
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Audit student, alumni, and admin user accounts across the entire platform.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={HiOutlineShieldCheck}
          onClick={() => navigate(ROUTES.ADMIN_ALUMNI_VERIFICATION)}
          className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
        >
          Alumni Verifications
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 sm:p-5 border border-[#26334D] shadow-soft-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name or email address..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <select
              value={isVerified}
              onChange={(e) => setIsVerified(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Verification</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Search
            </Button>

            {(search || role || isActive || isVerified) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={HiOutlineX}
                onClick={handleClearFilters}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No users found"
          description="No user accounts matched the filter criteria."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]">
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {users.map((u) => {
                  const isUpdating = updatingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-[#202B40]/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.profilePicture ? (
                            <img
                              src={u.profilePicture}
                              alt={u.fullName || 'User'}
                              className="w-10 h-10 rounded-full object-cover border border-[#26334D]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-xs border border-[#6366F1]/30">
                              {u.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#F8FAFC]">{u.fullName}</p>
                            <p className="text-xs text-[#94A3B8]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            u.role === 'admin'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : u.role === 'alumni'
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                              : 'bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="px-6 py-4">
                        {u.role === 'alumni' ? (
                          u.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                              <HiOutlineBadgeCheck className="w-4 h-4" /> Verified
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-400">
                              Pending
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-[#64748B]">N/A</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            u.isActive
                              ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/60'
                              : 'bg-rose-950/80 text-rose-300 hover:bg-rose-900/80 border border-rose-800/60'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-[#94A3B8]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#818CF8] hover:bg-[#202B40] transition-colors"
                            title="View Full User Details"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete / Deactivate User"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onPageChange={(p) => fetchUsers(p)}
            />
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Deactivate / Delete User"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to deactivate the account for{' '}
            <span className="font-bold text-[#F8FAFC]">{userToDelete?.fullName}</span> ({userToDelete?.email})? The user will no longer be able to log in.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleConfirmDelete}
            >
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
