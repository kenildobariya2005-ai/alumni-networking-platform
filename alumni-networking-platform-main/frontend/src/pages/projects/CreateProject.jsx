import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineCode,
  HiOutlineExternalLink,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { projectService } from '../../services/projectService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ROUTES from '../../constants/routes.js';

export const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    requiredSkills: '',
    maxTeamSize: 5,
    deadline: '',
    repositoryUrl: '',
    demoUrl: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Project description is required');
      return;
    }

    if (formData.deadline) {
      const d = new Date(formData.deadline);
      if (d <= new Date()) {
        toast.error('Project deadline must be in the future');
        return;
      }
    }

    try {
      setSubmitting(true);
      const skillsArray = formData.requiredSkills
        ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await projectService.createProject({
        title: formData.title.trim(),
        category: formData.category,
        requiredSkills: skillsArray,
        maxTeamSize: Number(formData.maxTeamSize) || 5,
        deadline: formData.deadline || undefined,
        repositoryUrl: formData.repositoryUrl.trim() || undefined,
        demoUrl: formData.demoUrl.trim() || undefined,
        description: formData.description.trim(),
      });

      toast.success('Collaborative project created successfully!');
      navigate(ROUTES.ALUMNI_PROJECTS);
    } catch (err) {
      toast.error(err?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
        <div className="border-b border-[#26334D] pb-4">
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Alumni Innovation Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Create Collaborative Project
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Launch open-source projects or industry incubators and assemble a dedicated student team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI-Powered Healthcare Diagnostic Portal"
              required
            />

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
                Category / Domain
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#334155] px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none bg-[#202B40] text-[#F8FAFC] font-medium"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="AI/ML">AI / Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud">Cloud & DevOps</option>
                <option value="IoT">IoT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Maximum Team Size (1 - 20)"
              name="maxTeamSize"
              type="number"
              min="1"
              max="20"
              value={formData.maxTeamSize}
              onChange={handleChange}
              icon={HiOutlineUserGroup}
              required
            />

            <Input
              label="Target Milestone Deadline (Optional)"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              icon={HiOutlineCalendar}
            />

            <Input
              label="Source Code Repository URL (Optional)"
              name="repositoryUrl"
              type="url"
              value={formData.repositoryUrl}
              onChange={handleChange}
              placeholder="https://github.com/org/repo"
              icon={HiOutlineCode}
            />

            <Input
              label="Live Demo / Website URL (Optional)"
              name="demoUrl"
              type="url"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://projectdemo.app"
              icon={HiOutlineExternalLink}
            />
          </div>

          <div>
            <Input
              label="Required Skills & Stack (comma-separated)"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, PyTorch, Tailwind, Docker, MongoDB"
              icon={HiOutlineTag}
              helperText="Specify key technologies team members will learn and work with"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
              Project Description & Goals <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the architectural roadmap, deliverables, student responsibilities, and expected learning outcomes..."
              required
              className="w-full rounded-2xl border border-[#334155] bg-[#202B40] px-4 py-3 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none leading-relaxed transition-all"
            />
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
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Launch Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
