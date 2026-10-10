import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Link2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, roomId, roomName }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const fullUrl = window.location.href;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success('Room link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyRoomIdOnly = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopiedId(false), 2000);
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
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Share Collaboration Room</h3>
            <p className="text-xs text-ide-muted">Invite teammates to edit code live with real-time CRDT</p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Shareable Link Box */}
          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-400" /> Shareable Room URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="flex-1 bg-ide-bg border border-ide-border rounded-xl px-3 py-2 text-xs text-ide-muted select-all focus:outline-none"
              />
              <button
                onClick={copyUrl}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Room Code */}
          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5">
              Room Identifier
            </label>
            <div className="flex items-center justify-between p-3 bg-ide-bg rounded-xl border border-ide-border">
              <span className="font-mono text-sm font-semibold text-purple-400">{roomId}</span>
              <button
                onClick={copyRoomIdOnly}
                className="text-xs text-ide-muted hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy ID</span>
              </button>
            </div>
          </div>

          {/* Room Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
            <p className="font-semibold mb-1">Instant Guest Access Enabled</p>
            <p className="text-[11px] text-blue-300/80">
              Anyone with this link can join as a guest editor, view presence cursors, and write code in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
