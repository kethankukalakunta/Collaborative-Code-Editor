import React from 'react';
import { Code2, Github, Heart, Cpu, Shield, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-ide-border bg-ide-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">SyncCode</span>
            <p className="text-xs text-ide-muted">High-Performance Real-Time CRDT Collaborative Code Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-ide-muted">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Yjs CRDT Synchronization
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Monaco Editor v0.52
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> Secure Isolated Execution
          </span>
        </div>

        <div className="text-xs text-ide-muted">
          &copy; {new Date().getFullYear()} SyncCode. Built with MERN Stack & Yjs.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
