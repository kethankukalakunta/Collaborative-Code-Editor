import React from 'react';
import { Users, Copy, Check, Shield, Circle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const CollaboratorsList = ({ users = [], currentUser = {}, roomId }) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Room invitation link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-ide-sidebar border-r border-ide-border select-none text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ide-border">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="font-semibold uppercase tracking-wider text-ide-muted text-[11px]">
            Active Peers ({users.length})
          </span>
        </div>
        <button
          onClick={copyRoomLink}
          title="Copy Room Link"
          className="p-1 rounded hover:bg-ide-surface text-ide-muted hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Room ID Badge */}
      <div className="p-3 bg-ide-surface/60 border-b border-ide-border">
        <div className="text-[10px] text-ide-muted uppercase tracking-wider mb-1">Room ID</div>
        <div className="flex items-center justify-between bg-ide-bg px-2.5 py-1.5 rounded-md border border-ide-border">
          <code className="text-xs font-mono text-blue-400 font-semibold">{roomId}</code>
          <button
            onClick={copyRoomLink}
            className="text-[10px] text-ide-muted hover:text-white transition-colors"
          >
            Share
          </button>
        </div>
      </div>

      {/* Collaborators List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {users.map((peer) => {
          const isMe = peer.socketId === currentUser?.socketId || peer.id === currentUser?.id;
          const userColor = peer.color || '#3b82f6';

          return (
            <div
              key={peer.socketId || peer.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                isMe
                  ? 'bg-ide-surface border-blue-500/30 shadow-sm'
                  : 'bg-ide-bg/60 border-ide-border hover:border-ide-border/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: userColor }}
                  >
                    {peer.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-ide-sidebar" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white truncate text-xs">
                      {peer.displayName || 'Collaborator'}
                    </span>
                    {isMe && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-semibold border border-blue-500/30">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ide-muted block truncate">
                    {peer.isGuest ? 'Guest Editor' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Cursor color indicator */}
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: userColor, boxShadow: `0 0 6px ${userColor}` }}
                title={`Cursor Color: ${userColor}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollaboratorsList;
