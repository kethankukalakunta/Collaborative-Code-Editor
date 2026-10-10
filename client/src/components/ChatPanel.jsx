import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bell } from 'lucide-react';

const ChatPanel = ({ messages = [], onSendMessage, currentUser = {} }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-ide-sidebar border-r border-ide-border select-none text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ide-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="font-semibold uppercase tracking-wider text-ide-muted text-[11px]">
            Room Chat
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-ide-muted text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No messages yet.</p>
            <p className="text-[10px] mt-1">Start chatting with your team!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="flex items-center justify-center gap-1.5 text-[10px] text-ide-muted py-1 bg-ide-surface/40 rounded-lg px-2">
                  <Bell className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              );
            }

            const isMe = msg.user?.id === currentUser?.id || msg.user?.socketId === currentUser?.socketId;
            const userColor = msg.user?.color || '#3b82f6';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-ide-muted">
                  <span
                    className="font-semibold"
                    style={{ color: userColor }}
                  >
                    {isMe ? 'You' : msg.user?.displayName || 'Peer'}
                  </span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-ide-surface text-ide-text border border-ide-border rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-2 border-t border-ide-border bg-ide-bg flex items-center gap-1.5">
        <input
          type="text"
          placeholder="Send a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-ide-surface border border-ide-border rounded-xl px-3 py-2 text-xs text-white placeholder-ide-muted focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
