import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineGlobe,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { communityService } from '../../services/communityService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ROUTES from '../../constants/routes.js';

export const CreatePost = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image.trim()) {
      toast.error('Please enter post content or an image URL');
      return;
    }

    try {
      setSubmitting(true);
      await communityService.createPost({
        content: content.trim(),
        tags: tags.trim(),
        image: image.trim(),
        visibility,
      });

      toast.success('Post published successfully!');
      navigate(ROUTES.COMMUNITY);
    } catch (err) {
      toast.error(err?.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Feed
      </button>

      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
        <div className="border-b border-[#26334D] pb-4">
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Share with AlumniConnect
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Create Community Post
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Share technical articles, ask advice, celebrate career wins, or post questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
              Post Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with the community today?"
              required
              className="w-full rounded-2xl border border-[#334155] bg-[#202B40] text-[#F8FAFC] px-4 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none placeholder-[#64748B] leading-relaxed"
            />
          </div>

          <div>
            <Input
              label="Tags (comma-separated)"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. webdev, cloud, internship, interview, machinelearning"
              icon={HiOutlineTag}
              helperText="Add relevant hashtags to help students and alumni discover your post"
            />
          </div>

          <div>
            <Input
              label="Image URL (Optional)"
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/project-screenshot.png"
              icon={HiOutlinePhotograph}
            />
          </div>

          {image && (
            <div className="rounded-2xl overflow-hidden border border-[#26334D] max-h-60 bg-[#202B40] flex items-center justify-center p-2">
              <img
                src={image}
                alt="Preview"
                className="max-h-56 w-auto object-contain rounded-xl"
                onError={() => toast.error('Failed to load image preview. Check URL.')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
              Post Visibility & Audience
            </label>
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-xl border border-[#334155] px-4 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none bg-[#202B40] text-[#F8FAFC] font-medium"
              >
                <option value="public">Public (Visible to all students, alumni, and admins)</option>
                <option value="institution">Institution only (Campus members only)</option>
                <option value="alumni">Alumni only</option>
                <option value="student">Students only</option>
                <option value="connections">Connections only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26334D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Publish Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
