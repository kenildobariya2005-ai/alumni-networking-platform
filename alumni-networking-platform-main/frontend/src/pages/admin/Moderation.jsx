import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentReport,
  HiOutlineChatAlt,
  HiOutlineEyeOff,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineSearch,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const Moderation = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchModerationData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        };

        if (activeTab === 'posts') {
          const data = await adminService.getModerationPosts(params);
          if (data?.data) {
            setItems(data.data.posts || []);
            setPagination((prev) => ({
              ...prev,
              page: data.data.pagination?.page || page,
              pages: data.data.pagination?.totalPages || 1,
              total: data.data.pagination?.totalPosts || 0,
            }));
          }
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch moderation items');
      } finally {
        setLoading(false);
      }
    },
    [activeTab, statusFilter, search, pagination.limit]
  );

  useEffect(() => {
    fetchModerationData(1);
  }, [activeTab, statusFilter]);

  const handleHide = async (id) => {
    try {
      if (activeTab === 'posts') {
        await adminService.hidePost(id);
        toast.success('Post hidden from community feed');
      } else {
        await adminService.hideComment(id);
        toast.success('Comment hidden');
      }
      fetchModerationData(pagination.page);
    } catch (err) {
      toast.error('Failed to hide content');
    }
  };

  const handleRestore = async (id) => {
    try {
      if (activeTab === 'posts') {
        await adminService.restorePost(id);
        toast.success('Post restored to community feed');
      } else {
        await adminService.restoreComment(id);
        toast.success('Comment restored');
      }
      fetchModerationData(pagination.page);
    } catch (err) {
      toast.error('Failed to restore content');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleting(true);
      if (activeTab === 'posts') {
        await adminService.deletePost(confirmDeleteId);
        toast.success('Post deleted by moderator');
      } else {
        await adminService.deleteComment(confirmDeleteId);
        toast.success('Comment deleted by moderator');
      }
      setConfirmDeleteId(null);
      fetchModerationData(pagination.page);
    } catch (err) {
      toast.error('Failed to delete content');
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
            Content Safety & Policy
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Community Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Review community contributions, hide offensive material, and manage forum compliance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#202B40] p-1 rounded-2xl border border-[#26334D]">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-[#6366F1] text-white shadow-soft-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Posts ({activeTab === 'posts' ? pagination.total : '...'})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content or author..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Moderation Items List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading moderation feed..." />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentReport}
          title="No content for moderation"
          description="All posts and comments comply with standard community guidelines."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Content Snippet</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {items.map((item) => {
                  const author = item.author || {};

                  return (
                    <tr key={item._id} className="hover:bg-[#202B40]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-[#6366F1]/30">
                            {author.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-[#F8FAFC]">{author.fullName || 'User'}</p>
                            <p className="text-[11px] text-[#94A3B8]">{author.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-[#CBD5E1] line-clamp-2 max-w-md leading-relaxed">
                          {item.content}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs text-[#94A3B8]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            item.status === 'active'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : item.status === 'hidden'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {item.status || 'active'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'hidden' ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(item._id)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-emerald-400 hover:bg-[#202B40] transition-colors"
                              title="Restore Content"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleHide(item._id)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-amber-400 hover:bg-[#202B40] transition-colors"
                              title="Hide Content"
                            >
                              <HiOutlineEyeOff className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item._id)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete Content"
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
              onPageChange={(p) => fetchModerationData(p)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirm Content Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to permanently delete this content item? This action will remove it from all feeds and audit logs will record the moderation action.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteId(null)}
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
              Delete Content
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Moderation;
