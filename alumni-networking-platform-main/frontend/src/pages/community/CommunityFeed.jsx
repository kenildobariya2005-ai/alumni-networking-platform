import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { communityService } from '../../services/communityService.js';
import PostCard from '../../components/cards/PostCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import ROUTES from '../../constants/routes.js';

export const CommunityFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('newest');

  // Quick Post Modal
  const [showQuickPostModal, setShowQuickPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [creatingPost, setCreatingPost] = useState(false);

  // Delete Post Confirmation Modal
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPost, setDeletingPost] = useState(false);

  const fetchPosts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          tag: tag.trim() || undefined,
          sort,
        };

        const data = await communityService.getPosts(params);
        if (data?.data) {
          setPosts(data.data.posts || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalPosts || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch community posts');
      } finally {
        setLoading(false);
      }
    },
    [search, tag, sort, pagination.limit]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setTag('');
    setSort('newest');
  };

  const handleToggleLike = async (postId) => {
    try {
      const data = await communityService.toggleLikePost(postId);
      if (data?.data) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const currentUserId = user?._id?.toString();
              const isLiked = data.data.isLiked;
              let updatedLikes = Array.isArray(p.likes) ? [...p.likes] : [];

              if (isLiked) {
                if (!updatedLikes.some((id) => (id?._id || id).toString() === currentUserId)) {
                  updatedLikes.push(user);
                }
              } else {
                updatedLikes = updatedLikes.filter(
                  (id) => (id?._id || id).toString() !== currentUserId
                );
              }

              return {
                ...p,
                likesCount: data.data.likesCount,
                likes: updatedLikes,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const data = await communityService.createComment(postId, { content });
      if (data?.data?.comment) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const existingComments = Array.isArray(p.comments) ? p.comments : [];
              return {
                ...p,
                commentsCount: (p.commentsCount || 0) + 1,
                comments: [...existingComments, data.data.comment],
              };
            }
            return p;
          })
        );
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to post comment');
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await communityService.deleteComment(commentId);
      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
          comments: Array.isArray(p.comments)
            ? p.comments.filter((c) => c._id !== commentId)
            : [],
        }))
      );
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete comment');
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      setDeletingPost(true);
      await communityService.deletePost(postToDelete);
      toast.success('Post removed from feed');
      setPostToDelete(null);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete post');
    } finally {
      setDeletingPost(false);
    }
  };

  const handleCreateQuickPost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage.trim()) {
      toast.error('Please enter some content or an image');
      return;
    }

    try {
      setCreatingPost(true);
      const res = await communityService.createPost({
        content: postContent.trim(),
        image: postImage.trim(),
        tags: postTags.trim(),
        visibility: postVisibility,
      });

      if (res?.data?.post) {
        toast.success('Post published to community!');
        setShowQuickPostModal(false);
        setPostContent('');
        setPostTags('');
        setPostImage('');
        fetchPosts(1);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Alumni & Student Network
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Community Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Share updates, ask career questions, and discuss engineering topics with peers and alumni.
          </p>
        </div>

        <Button
          variant="primary"
          icon={HiOutlinePlus}
          onClick={() => setShowQuickPostModal(true)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
        >
          Create Post
        </Button>
      </div>

      {/* Quick Compose Input Box */}
      <div
        onClick={() => setShowQuickPostModal(true)}
        className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex items-center gap-3 cursor-pointer hover:border-[#6366F1]/60 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-sm flex-shrink-0 border border-[#6366F1]/30">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 bg-[#202B40] hover:bg-[#26334D] transition-colors rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#94A3B8] border border-[#334155]">
          Share a career milestone, ask a question, or post a discussion topic...
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions and posts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
          />
        </form>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Filter tag (#career)..."
            className="w-36 px-3 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Liked</option>
            <option value="oldest">Oldest</option>
          </select>

          {(search || tag) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={HiOutlineX}
              onClick={handleClearFilters}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading community posts..." />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No posts found"
          description="Be the first to start a conversation in the community!"
          action={
            <Button variant="primary" size="sm" onClick={() => setShowQuickPostModal(true)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm">
              Create First Post
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const authorId = post.author?._id?.toString() || post.author?.toString();
            const canDelete = authorId === user?._id?.toString() || user?.role === 'admin';

            return (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onToggleLike={handleToggleLike}
                onDeletePost={(postId) => setPostToDelete(postId)}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                canDelete={canDelete}
                isAdmin={user?.role === 'admin'}
              />
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchPosts(p)}
          />
        </div>
      )}

      {/* Quick Create Post Modal */}
      <Modal
        isOpen={showQuickPostModal}
        onClose={() => setShowQuickPostModal(false)}
        title="Create Community Post"
      >
        <form onSubmit={handleCreateQuickPost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Post Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What would you like to share or ask with the AlumniConnect community?"
              required
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] text-[#F8FAFC] px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
              placeholder="e.g. career, react, internship, mockinterview"
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] text-[#F8FAFC] px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={postImage}
              onChange={(e) => setPostImage(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] text-[#F8FAFC] px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Audience / Visibility
            </label>
            <select
              value={postVisibility}
              onChange={(e) => setPostVisibility(e.target.value)}
              className="w-full rounded-xl border border-[#334155] px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none bg-[#202B40] text-[#F8FAFC]"
            >
              <option value="public">Public (All users)</option>
              <option value="institution">Institution only</option>
              <option value="alumni">Alumni only</option>
              <option value="student">Students only</option>
              <option value="connections">Connections only</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQuickPostModal(false)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={creatingPost}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Post Confirmation Modal */}
      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Delete Community Post"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPostToDelete(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deletingPost}
              onClick={handleConfirmDeletePost}
            >
              Delete Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityFeed;

