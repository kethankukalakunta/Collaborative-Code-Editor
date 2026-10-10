import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, 
  Plus, 
  Code2, 
  Users, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Search,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NewProjectModal from '../components/NewProjectModal';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      setProjects(res.data.data || []);
    } catch (err) {
      console.warn('Could not fetch projects list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProj) => {
    setProjects([newProj, ...projects]);
    navigate(`/room/${newProj.activeRoomId || newProj._id || newProj.id}`);
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter((p) => (p._id || p.id) !== projectId));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinRoomInput.trim()) {
      let cleaned = joinRoomInput.trim();
      if (cleaned.includes('/room/')) {
        cleaned = cleaned.split('/room/').pop();
      }
      navigate(`/room/${cleaned}`);
    }
  };

  const createInstantRoom = () => {
    const randomRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/room/${randomRoomId}`);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-ide-bg text-ide-text">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* User Greeting & Stats Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-ide-surface via-ide-surface/80 to-blue-950/30 border border-ide-border relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {isAuthenticated ? 'Authenticated Account' : 'Guest Mode Active'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {user?.displayName || 'Developer'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-ide-muted max-w-xl leading-relaxed">
                Manage your collaborative projects, launch instantaneous shared sandbox rooms, and invite your team to code live.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-glow hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>

              <button
                onClick={createInstantRoom}
                className="px-5 py-2.5 rounded-xl bg-ide-surface hover:bg-ide-active text-white font-medium text-xs sm:text-sm flex items-center gap-2 border border-ide-border transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Quick Blank Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Join and Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Join Room by ID Box */}
          <div className="md:col-span-1 p-5 rounded-2xl bg-ide-surface border border-ide-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Join Existing Room
            </h3>
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter room ID or link..."
                value={joinRoomInput}
                onChange={(e) => setJoinRoomInput(e.target.value)}
                className="flex-1 bg-ide-bg border border-ide-border rounded-xl px-3 py-2 text-xs text-white placeholder-ide-muted focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!joinRoomInput.trim()}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

          {/* Search Filter Box */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-ide-surface border border-ide-border flex flex-col justify-between space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Search Your Workspaces
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-ide-muted" />
              <input
                type="text"
                placeholder="Filter by project name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-ide-bg border border-ide-border rounded-xl text-xs text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-400" />
              Your Projects & Rooms ({filteredProjects.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 rounded-2xl bg-ide-surface border border-ide-border animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-ide-surface/40 border border-dashed border-ide-border rounded-3xl space-y-3">
              <Code2 className="w-10 h-10 text-ide-muted mx-auto opacity-40" />
              <h3 className="text-sm font-semibold text-white">No projects found</h3>
              <p className="text-xs text-ide-muted max-w-sm mx-auto">
                Create a project or launch an instant blank room to start coding collaboratively.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const projectId = project._id || project.id;
                const roomId = project.activeRoomId || `room-${projectId?.substring(0, 8)}`;

                return (
                  <div
                    key={projectId}
                    onClick={() => navigate(`/room/${roomId}`)}
                    className="p-5 rounded-2xl bg-ide-surface border border-ide-border hover:border-blue-500/50 hover:bg-ide-surface/90 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-ide-bg border border-ide-border text-ide-muted">
                            {project.files?.length || 1} files
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {project.isPublic ? (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Public
                            </span>
                          ) : (
                            <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Private
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-ide-muted line-clamp-2 leading-relaxed">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-ide-border/70 flex items-center justify-between text-xs text-ide-muted">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" /> {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteProject(e, projectId)}
                          title="Delete Project"
                          className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-semibold">
                          Open <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <Footer />

      {/* New Project Dialog */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default DashboardPage;
