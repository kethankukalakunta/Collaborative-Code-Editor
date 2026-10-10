import React, { useState } from 'react';
import { X, FolderPlus, Code2, Globe, Lock } from 'lucide-react';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await projectsAPI.create({
        name: name.trim(),
        description: description.trim(),
        language,
        isPublic,
      });

      toast.success('Project created successfully!');
      if (onProjectCreated) {
        onProjectCreated(res.data.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ide-surface border border-ide-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ide-muted hover:text-white rounded-lg hover:bg-ide-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create New Project</h3>
            <p className="text-xs text-ide-muted">Set up files and start collaborating</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Algorithm Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ide-bg border border-ide-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief summary of the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ide-bg border border-ide-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5">Starter Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-ide-bg border border-ide-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java</option>
              <option value="html">HTML5 / CSS / Web</option>
            </select>
          </div>

          <div className="pt-2 border-t border-ide-border">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-ide-muted flex items-center gap-1.5">
                {isPublic ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-yellow-400" />}
                <span>{isPublic ? 'Public Project (Anyone with room link can join)' : 'Private Project'}</span>
              </span>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-glow hover:shadow-blue-500/40 transition-all cursor-pointer mt-4"
          >
            {isSubmitting ? 'Creating...' : 'Create & Open Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
