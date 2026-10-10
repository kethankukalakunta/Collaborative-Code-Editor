import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, PlusCircle, LayoutDashboard, User, LogOut, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const createQuickRoom = () => {
    const randomRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/room/${randomRoomId}`);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-ide-border bg-ide-bg/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  SyncCode <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">Live</span>
                </span>
                <span className="text-[10px] text-ide-muted tracking-wide block -mt-1">Real-Time CRDT Editor</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-ide-muted hover:text-white flex items-center gap-2 transition-colors py-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                Dashboard
              </Link>

              <button
                onClick={createQuickRoom}
                className="text-sm font-medium text-ide-muted hover:text-white flex items-center gap-2 transition-colors py-1.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Quick Sandbox
              </button>

              <a
                href="#features"
                className="text-sm font-medium text-ide-muted hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-ide-muted hover:text-white transition-colors"
              >
                Architecture
              </a>
            </div>

            {/* User Account / Auth Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-ide-surface border border-ide-border">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                      alt={user?.displayName}
                      className="w-6 h-6 rounded-full bg-blue-500/20"
                    />
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">
                      {user?.displayName}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-ide-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-3.5 py-1.5 text-sm font-medium text-ide-muted hover:text-white rounded-lg hover:bg-ide-surface transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-glow hover:shadow-blue-500/40 transition-all"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-ide-muted hover:text-white hover:bg-ide-surface"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ide-border bg-ide-sidebar px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-ide-surface"
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                createQuickRoom();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-ide-surface"
            >
              Quick Sandbox
            </button>
            <div className="pt-4 border-t border-ide-border space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Log Out ({user?.displayName})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full py-2 text-sm font-medium text-white bg-ide-surface rounded-lg border border-ide-border"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
