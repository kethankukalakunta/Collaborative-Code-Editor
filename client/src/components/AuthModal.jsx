import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, createGuestSession } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === 'login') {
      const success = await login(email, password);
      if (success) onClose();
    } else if (mode === 'register') {
      const success = await register(username, displayName || username, email, password);
      if (success) onClose();
    } else if (mode === 'guest') {
      await createGuestSession(guestName);
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ide-surface border border-ide-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ide-muted hover:text-white rounded-lg hover:bg-ide-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-ide-border mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-ide-muted hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-ide-muted hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setMode('guest')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              mode === 'guest'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-ide-muted hover:text-white'
            }`}
          >
            Guest Join
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'guest' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Join immediately without an account. You can collaborate, edit code, and chat in any public or shared room.</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-ide-muted mb-1.5">Collaborator Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-ide-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex (Frontend Dev)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-ide-bg border border-ide-border rounded-xl text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-ide-muted mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-ide-muted" />
                      <input
                        type="text"
                        required
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-ide-bg border border-ide-border rounded-xl text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ide-muted mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-ide-muted" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-ide-bg border border-ide-border rounded-xl text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-ide-muted mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-ide-muted" />
                  <input
                    type="email"
                    required
                    placeholder="dev@synccode.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-ide-bg border border-ide-border rounded-xl text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ide-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-ide-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-ide-bg border border-ide-border rounded-xl text-sm text-white placeholder-ide-muted focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-blue-500/40 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Continue as Guest'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-ide-muted flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Passwords securely hashed with bcrypt & JWT tokenized
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
