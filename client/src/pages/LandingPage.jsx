import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Users, 
  Zap, 
  Terminal, 
  Shield, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  Share2, 
  FolderTree, 
  Layers, 
  CheckCircle2,
  GitBranch,
  Play
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      let cleaned = roomIdInput.trim();
      if (cleaned.includes('/room/')) {
        cleaned = cleaned.split('/room/').pop();
      }
      navigate(`/room/${cleaned}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ide-bg text-ide-text">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-grid-pattern">
        
        {/* Glowing atmospheric lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shadow-sm animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CRDT-Powered Real-Time Collaborative Coding</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Code Together, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              In Real Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-ide-muted leading-relaxed">
            A high-performance browser IDE with Monaco Editor, Yjs CRDT conflict-free synchronization, live presence cursors, multi-file trees, and sandboxed execution.
          </p>

          {/* Quick Action CTA Box */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCreateRoom}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-glow hover:shadow-blue-500/50 transition-all cursor-pointer group"
            >
              <span>Create New Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Join Input */}
            <form onSubmit={handleJoinRoom} className="w-full sm:w-auto flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Room ID or link..."
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="w-full sm:w-64 bg-ide-surface border border-ide-border rounded-xl px-3.5 py-3 text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!roomIdInput.trim()}
                className="px-5 py-3 bg-ide-surface hover:bg-ide-active disabled:opacity-40 text-white font-medium text-sm rounded-xl border border-ide-border transition-colors cursor-pointer shrink-0"
              >
                Join
              </button>
            </form>
          </div>

          {/* Live Interactive Mock Preview */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-ide-border bg-ide-sidebar shadow-2xl overflow-hidden text-left">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-ide-surface/80 border-b border-ide-border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-ide-muted ml-2">room-synccode-crdt • index.js</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 3 Collaborators
                  </span>
                </div>
              </div>

              {/* Code Editor Mock Body */}
              <div className="p-6 font-mono text-xs sm:text-sm text-ide-text space-y-2.5 bg-ide-bg/95 relative overflow-hidden">
                <div className="flex gap-4">
                  <span className="text-ide-muted select-none w-6 text-right">1</span>
                  <span className="text-purple-400 font-semibold">import</span>
                  <span className="text-white">*</span>
                  <span className="text-purple-400 font-semibold">as</span>
                  <span className="text-yellow-300">Y</span>
                  <span className="text-purple-400 font-semibold">from</span>
                  <span className="text-emerald-300">'yjs'</span>;
                </div>

                <div className="flex gap-4">
                  <span className="text-ide-muted select-none w-6 text-right">2</span>
                  <span className="text-ide-muted">// Live Conflict-Free Replicated Data Type (CRDT) document</span>
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-ide-muted select-none w-6 text-right">3</span>
                  <span className="text-blue-400 font-semibold">const</span>
                  <span className="text-yellow-300">doc</span>
                  <span className="text-white">=</span>
                  <span className="text-blue-400 font-semibold">new</span>
                  <span className="text-cyan-300">Y.Doc</span>();
                  
                  {/* Remote Cursor 1 */}
                  <span className="inline-flex items-center relative ml-2">
                    <span className="w-0.5 h-4 bg-emerald-400 animate-pulse inline-block" />
                    <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-sans font-bold shadow">
                      Alex
                    </span>
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-ide-muted select-none w-6 text-right">4</span>
                  <span className="text-blue-400 font-semibold">const</span>
                  <span className="text-yellow-300">ytext</span>
                  <span className="text-white">=</span>
                  <span className="text-yellow-300">doc</span>.<span className="text-cyan-300">getText</span>(<span className="text-emerald-300">'monaco'</span>);
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-ide-muted select-none w-6 text-right">5</span>
                  <span className="text-yellow-300">ytext</span>.<span className="text-cyan-300">insert</span>(0, <span className="text-emerald-300">"Concurrent zero-conflict edits!"</span>);
                  
                  {/* Remote Cursor 2 */}
                  <span className="inline-flex items-center relative ml-3">
                    <span className="w-0.5 h-4 bg-purple-400 animate-pulse inline-block" />
                    <span className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-sans font-bold shadow">
                      Sarah
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Modern Developer Teams
          </h2>
          <p className="text-ide-muted text-sm sm:text-base">
            Every layer is built with sub-millisecond synchronization, reliable document persistence, and developer ergonomics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-blue-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">CRDT Synchronization (Yjs)</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              True decentralized conflict-free mathematical merging. Concurrent edits always converge deterministically without lost keystrokes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-emerald-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Presence & Cursors</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              Track collaborator caret positions, active selection highlights, and real-time user labels with unique collaborator color coding.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-purple-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Monaco VS Code Core</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              Full VS Code editing engine with syntax highlighting for JavaScript, Python, C++, Java, HTML, CSS, minimap, formatting, and shortcuts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-yellow-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Sandboxed Code Execution</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              Execute code securely across multiple languages with stdout/stderr terminal output, exit codes, and execution duration metrics.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-cyan-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-File Project Trees</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              Organize multi-file projects with isolated Y.Doc CRDT instances per file. Switch seamlessly without dropping live peer connections.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-ide-surface/60 border border-ide-border hover:border-pink-500/40 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant 1-Click Guest Invites</h3>
            <p className="text-xs text-ide-muted leading-relaxed">
              Share a unique room link for instant guest collaboration, or protect workspaces with JWT authentication and project permissions.
            </p>
          </div>

        </div>
      </section>

      {/* Architecture & CRDT Explanation */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-ide-border bg-ide-sidebar/40">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Why CRDTs Outperform Traditional OT
            </h2>
            <p className="text-xs sm:text-sm text-ide-muted">
              Understanding the distributed systems foundation of SyncCode
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-ide-surface/80 border border-ide-border space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                Yjs CRDT (Conflict-Free Replicated Data Types)
              </h3>
              <p className="text-xs text-ide-muted leading-relaxed">
                Edits are modeled as commutative operations. Regardless of network latency or out-of-order message arrival, any two peers that have received the same set of updates are guaranteed to be in the exact same state without central server arbitration.
              </p>
              <ul className="space-y-1.5 text-xs text-emerald-300/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Zero central locking or edit rejection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Seamless offline/reconnection sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Minimal binary-encoded state vectors
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-ide-surface/80 border border-ide-border space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Durable Persistence & Hybrid Cache
              </h3>
              <p className="text-xs text-ide-muted leading-relaxed">
                Document updates are debounced and persisted to MongoDB / cached state layers. When clients reconnect or a room is reopened after an idle period, the encoded Yjs state vector restores the full document instantly.
              </p>
              <ul className="space-y-1.5 text-xs text-blue-300/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Safe against sudden server restarts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Multi-file state independence
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Ephemeral awareness separation
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
