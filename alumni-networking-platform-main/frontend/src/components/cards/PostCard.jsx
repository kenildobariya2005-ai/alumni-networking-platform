import React, { useState } from 'react';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatAlt,
  HiOutlineTrash,
  HiOutlineGlobe,
  HiOutlineTag,
} from 'react-icons/hi';
import Button from '../common/Button.jsx';

/**
 * Reusable Community Post Card Component with modern dark theme styling
 */
export const PostCard = ({
  post,
  currentUserId,
  onToggleLike,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  canDelete = false,
  isAdmin = false,
  className = '',
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!post) return null;

  const author = post.author || {};
  const isLikedByCurrentUser =
    Array.isArray(post.likes) &&
    post.likes.some((like) => {
      const likeId = typeof like === 'string' ? like : like?._id;
      return likeId?.toString() === currentUserId?.toString();
    });

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;

    try {
      setIsSubmittingComment(true);
      await onAddComment(post._id, commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div
      className={`bg-[#151E32] rounded-3xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm transition-all duration-200 text-[#CBD5E1] ${className}`}
    >
      {/* Post Author Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {author.profilePicture ? (
            <img
              src={author.profilePicture}
              alt={author.fullName || 'User'}
              className="w-10 h-10 rounded-full object-cover border border-[#26334D]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-sm border border-[#6366F1]/30">
              {author.fullName?.charAt(0) || 'U'}
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-[#F8FAFC] leading-tight">
              {author.fullName || 'Anonymous'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#94A3B8]">
              <span className="capitalize font-medium text-[#CBD5E1]">
                {author.role || 'Member'}
              </span>
              <span>&bull;</span>
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
              {post.visibility && (
                <>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-0.5 capitalize">
                    <HiOutlineGlobe className="w-3 h-3 text-[#64748B]" />
                    {post.visibility}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Post Button (Author or Admin) */}
        {(canDelete || isAdmin) && onDeletePost && (
          <button
            type="button"
            onClick={() => onDeletePost(post._id)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Delete Post"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line mb-4">
          {post.content}
        </p>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-[#26334D] max-h-96 bg-[#202B40] flex items-center justify-center">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#202B40] text-[#818CF8] text-xs font-medium border border-[#6366F1]/30"
            >
              <HiOutlineTag className="w-3 h-3 text-[#64748B]" />
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons: Like, Comment count */}
      <div className="pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            type="button"
            onClick={() => onToggleLike && onToggleLike(post._id)}
            className={`inline-flex items-center gap-1.5 font-medium transition-colors py-1 px-2.5 rounded-xl ${
              isLikedByCurrentUser
                ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                : 'text-[#94A3B8] hover:bg-[#202B40] hover:text-[#F8FAFC]'
            }`}
          >
            {isLikedByCurrentUser ? (
              <HiHeart className="w-4 h-4 text-rose-500 fill-current" />
            ) : (
              <HiOutlineHeart className="w-4 h-4" />
            )}
            <span>{post.likesCount ?? post.likes?.length ?? 0} Likes</span>
          </button>

          {/* Comments toggle */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-1.5 font-medium text-[#94A3B8] hover:bg-[#202B40] hover:text-[#F8FAFC] transition-colors py-1 px-2.5 rounded-xl"
          >
            <HiOutlineChatAlt className="w-4 h-4" />
            <span>{post.commentsCount ?? 0} Comments</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#26334D] space-y-4 animate-fade-in">
          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={!commentText.trim()}
              isLoading={isSubmittingComment}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Post
            </Button>
          </form>

          {/* Comment list */}
          {Array.isArray(post.comments) && post.comments.length > 0 ? (
            <div className="space-y-3 pt-2">
              {post.comments.map((comment) => {
                const commentAuthor = comment.author || {};
                const canDeleteComment =
                  commentAuthor._id?.toString() === currentUserId?.toString() || isAdmin;

                return (
                  <div
                    key={comment._id}
                    className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#202B40] border border-[#26334D] text-xs text-[#CBD5E1]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#151E32] text-[#818CF8] font-bold flex items-center justify-center text-[10px] flex-shrink-0 border border-[#6366F1]/30">
                        {commentAuthor.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#F8FAFC]">
                            {commentAuthor.fullName}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-[#CBD5E1] mt-0.5">{comment.content}</p>
                      </div>
                    </div>

                    {canDeleteComment && onDeleteComment && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment._id)}
                        className="text-[#94A3B8] hover:text-rose-400 p-1 transition-colors"
                        title="Delete Comment"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PostCard;

