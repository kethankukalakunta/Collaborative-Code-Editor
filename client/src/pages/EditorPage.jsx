import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { 
  Code2, 
  Play, 
  Save, 
  Share2, 
  Sliders, 
  MessageSquare, 
  Users, 
  FolderTree, 
  LogOut, 
  Check, 
  RefreshCw, 
  Terminal, 
  Sparkles,
  Download,
  Copy,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSocket, connectSocket } from '../services/socket';
import { SocketIOYjsProvider } from '../services/yjsProvider';
import { roomsAPI, executeAPI } from '../services/api';

import FileExplorer from '../components/FileExplorer';
import CollaboratorsList from '../components/CollaboratorsList';
import ChatPanel from '../components/ChatPanel';
import OutputPanel from '../components/OutputPanel';
import ShareModal from '../components/ShareModal';
import SettingsModal from '../components/SettingsModal';
import toast from 'react-hot-toast';

const LANGUAGE_MAP = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  cpp: 'cpp',
  c: 'c',
  h: 'cpp',
  java: 'java',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
};

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (Node.js)', ext: 'js' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'python', label: 'Python 3', ext: 'py' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'c', label: 'C', ext: 'c' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'html', label: 'HTML5', ext: 'html' },
  { id: 'css', label: 'CSS3', ext: 'css' },
  { id: 'json', label: 'JSON', ext: 'json' },
  { id: 'markdown', label: 'Markdown', ext: 'md' },
  { id: 'rust', label: 'Rust', ext: 'rs' },
  { id: 'go', label: 'Go', ext: 'go' },
  { id: 'sql', label: 'SQL', ext: 'sql' },
];

const DEFAULT_FILES = [
  {
    fileId: 'main',
    name: 'index.js',
    language: 'javascript',
    content: '',
  },
];

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, fontSize, tabSize, minimap, wordWrap } = useTheme();

  // Workspace Files state
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState('main');
  const [roomName, setRoomName] = useState('Collaborative Session');

  // Active File & Language
  const currentFile = files.find((f) => f.fileId === activeFileId) || files[0] || DEFAULT_FILES[0];
  const currentLang = currentFile?.language || 'javascript';

  // Sidebar Panel State ('files', 'collaborators', 'chat', 'none')
  const [sidebarTab, setSidebarTab] = useState('files');
  const [outputOpen, setOutputOpen] = useState(false);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Live Collaboration State
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomLogs, setRoomLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'online', 'connecting', 'offline'

  // Code Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [outputData, setOutputData] = useState(null);

  // References for Monaco & Yjs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const remoteDecorationsRef = useRef([]);

  // Fetch Room & Project details from backend when roomId loads
  useEffect(() => {
    let isMounted = true;
    const fetchRoomDetails = async () => {
      try {
        const res = await roomsAPI.get(roomId);
        if (isMounted && res.data?.success && res.data?.data) {
          const roomData = res.data.data;
          if (roomData.roomName) {
            setRoomName(roomData.roomName);
          }
          if (roomData.files && Array.isArray(roomData.files) && roomData.files.length > 0) {
            setFiles(roomData.files);
            setActiveFileId(roomData.files[0].fileId);
          }
        }
      } catch (err) {
        console.warn('Could not fetch room details:', err.message);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Handler for changing code language
  const handleLanguageChange = (newLang) => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === newLang) || { id: newLang, ext: newLang };

    // Update Monaco editor model language immediately
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, newLang);
      }
    }

    // Update active file in state
    setFiles((prev) =>
      prev.map((f) => {
        if (f.fileId === activeFileId) {
          let updatedName = f.name;
          const parts = f.name.split('.');
          if (parts.length > 1) {
            parts[parts.length - 1] = langObj.ext;
            updatedName = parts.join('.');
          }
          return { ...f, name: updatedName, language: newLang };
        }
        return f;
      })
    );

    toast.success(`Language set to ${langObj.label}`);
    addLog(`Changed language to ${langObj.label} for active file`);
  };

  // Add Room Activity Log helper
  const addLog = useCallback((text) => {
    const time = new Date().toLocaleTimeString();
    setRoomLogs((prev) => [{ time, text }, ...prev.slice(0, 49)]);
  }, []);

  const activeFileIdRef = useRef(activeFileId);
  const currentFileRef = useRef(currentFile);
  const userRef = useRef(user);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
    currentFileRef.current = currentFile;
    userRef.current = user;
  }, [activeFileId, currentFile, user]);

  // 1. Initialize Socket.IO connection and room listeners
  useEffect(() => {
    if (!roomId) return;

    const socket = connectSocket();
    setConnectionStatus(socket.connected ? 'online' : 'connecting');

    const handleConnect = () => {
      setConnectionStatus('online');
      addLog('Connected to collaboration server');

      // Join Room
      const currUser = userRef.current;
      const currFile = currentFileRef.current;
      socket.emit('room:join', {
        roomId,
        fileId: activeFileIdRef.current,
        fileName: currFile.name,
        language: currFile.language,
        user: {
          id: currUser?.id || currUser?._id,
          username: currUser?.username,
          displayName: currUser?.displayName,
          avatar: currUser?.avatar,
          color: currUser?.color,
          isGuest: currUser?.isGuest,
        },
      });
    };

    const handleDisconnect = () => {
      setConnectionStatus('offline');
      addLog('Disconnected from collaboration server');
    };

    const handleRoomUsers = (data) => {
      setConnectedUsers(data.users || []);
    };

    const handleUserJoined = (data) => {
      setConnectedUsers(data.users || []);
      toast.custom(
        (t) => (
          <div className="bg-ide-surface border border-emerald-500/30 text-white px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span><strong style={{ color: data.user.color }}>{data.user.displayName}</strong> joined the session</span>
          </div>
        ),
        { duration: 2500 }
      );
      addLog(`${data.user.displayName} joined the room`);
    };

    const handleUserLeft = (data) => {
      setConnectedUsers(data.users || []);
      addLog(`${data.user.displayName} left the room`);
    };

    const handleChatMessage = (payload) => {
      setRoomMessages((prev) => [...prev, payload]);
    };

    const handleRoomNotification = (payload) => {
      if (payload.type === 'save') {
        toast.success(payload.message, { duration: 2000 });
        addLog(payload.message);
      }
    };

    // Remote Cursor awareness listener
    const handleRemoteCursor = (data) => {
      if (!editorRef.current || !monacoRef.current) return;
      if (data.fileId !== activeFileIdRef.current) return;

      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const { user: peerUser, cursor, selection } = data;

      if (!cursor || !peerUser) return;

      // Render decorations
      const newDecorations = [];
      
      // Cursor Line / Caret
      newDecorations.push({
        range: new monaco.Range(cursor.lineNumber, cursor.column, cursor.lineNumber, cursor.column + 1),
        options: {
          className: 'remote-caret',
          hoverMessage: { value: `**${peerUser.displayName}** is editing here` },
          after: {
            content: ` ${peerUser.displayName}`,
            inlineClassName: `remote-caret-flag bg-[${peerUser.color || '#3b82f6'}]`,
          },
        },
      });

      // Selection highlight
      if (selection && (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn)) {
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: 'remote-selection',
            inlineClassName: `bg-[${peerUser.color || '#3b82f6'}]/25`,
          },
        });
      }

      remoteDecorationsRef.current = editor.deltaDecorations(remoteDecorationsRef.current, newDecorations);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room:users', handleRoomUsers);
    socket.on('room:user-joined', handleUserJoined);
    socket.on('room:user-left', handleUserLeft);
    socket.on('chat:message', handleChatMessage);
    socket.on('room:notification', handleRoomNotification);
    socket.on('presence:cursor', handleRemoteCursor);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room:users', handleRoomUsers);
      socket.off('room:user-joined', handleUserJoined);
      socket.off('room:user-left', handleUserLeft);
      socket.off('chat:message', handleChatMessage);
      socket.off('room:notification', handleRoomNotification);
      socket.off('presence:cursor', handleRemoteCursor);
    };
  }, [roomId, addLog]);

  // 2. Setup Yjs and Monaco CRDT Binding for the active file
  const setupYjsBinding = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;

    // Clean up previous binding & provider
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Create fresh Y.Doc instance for this active file
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Initialize custom Yjs Socket.IO provider
    const provider = new SocketIOYjsProvider(roomId, activeFileId, ydoc);
    providerRef.current = provider;

    const ytext = ydoc.getText('monaco');

    // If document is newly opened and has initial file content
    if (currentFile.content && ytext.length === 0) {
      ytext.insert(0, currentFile.content);
    }

    // Monaco Yjs Binding
    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      null
    );
    bindingRef.current = binding;

    // Sync state listener
    provider.on('synced', () => {
      setConnectionStatus('online');
      addLog(`Synchronized ${currentFile.name} with peers`);
    });

  }, [roomId, activeFileId, currentFile, addLog]);

  // Handle Monaco Editor Mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Cursor position & selection change emitter for presence awareness
    editor.onDidChangeCursorPosition((e) => {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('presence:cursor', {
          roomId,
          fileId: activeFileId,
          cursor: {
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          },
          selection: editor.getSelection(),
        });
      }
    });

    setupYjsBinding();
  };

  // Re-bind when switching active files
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      // Switch socket file room
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('file:switch', {
          roomId,
          fileId: activeFileId,
          fileName: currentFile.name,
          language: currentFile.language,
        });
      }

      setupYjsBinding();
    }
  }, [activeFileId, setupYjsBinding, roomId, currentFile]);

  // File Management Handlers
  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleCreateFile = (newFileName) => {
    const ext = newFileName.split('.').pop();
    const lang = LANGUAGE_MAP[ext] || 'javascript';
    const newFileId = `file-${Math.random().toString(36).substr(2, 7)}`;

    const newFile = {
      fileId: newFileId,
      name: newFileName,
      language: lang,
      content: `// ${newFileName}\n`,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFileId);
    toast.success(`Created file ${newFileName}`);
  };

  const handleDeleteFile = (fileId) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.fileId !== fileId);
    setFiles(remaining);
    if (activeFileId === fileId) {
      setActiveFileId(remaining[0].fileId);
    }
    toast.success('File deleted');
  };

  const handleRenameFile = (fileId, newName) => {
    const ext = newName.split('.').pop();
    const lang = LANGUAGE_MAP[ext] || 'javascript';

    setFiles((prev) =>
      prev.map((f) => (f.fileId === fileId ? { ...f, name: newName, language: lang } : f))
    );
    toast.success(`Renamed to ${newName}`);
  };

  // Chat message sender
  const handleSendMessage = (messageText) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('chat:message', {
        roomId,
        message: messageText,
      });
    }
  };

  // Save Document to Server
  const handleSaveDocument = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    const code = editorRef.current.getValue();

    try {
      await roomsAPI.saveDoc(roomId, activeFileId, {
        content: code,
        fileName: currentFile.name,
        language: currentLang,
      });

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('document:saved', {
          roomId,
          fileId: activeFileId,
          fileName: currentFile.name,
        });
      }

      toast.success('Document saved successfully!');
    } catch (err) {
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Run Code Execution
  const handleRunCode = async () => {
    if (!editorRef.current) return;
    setIsRunning(true);
    setOutputOpen(true);
    const code = editorRef.current.getValue();

    try {
      const res = await executeAPI.run({
        language: currentLang,
        code,
      });

      setOutputData(res.data.data);
      addLog(`Executed ${currentFile.name} (${res.data.data.duration || '0ms'})`);
    } catch (err) {
      setOutputData({
        stdout: '',
        stderr: err.response?.data?.message || err.message || 'Execution failed',
        exitCode: 1,
        duration: '0ms',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Download Code File
  const handleDownloadFile = () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${currentFile.name}`);
  };

  // Copy All Code
  const handleCopyCode = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.getValue());
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg text-ide-text overflow-hidden select-none">
      
      {/* 1. Main Top Navigation Header */}
      <header className="h-13 bg-ide-sidebar border-b border-ide-border px-3.5 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Brand & Room Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            title="Return to Dashboard"
            className="flex items-center space-x-2 group p-1 rounded-lg hover:bg-ide-surface transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left max-w-[220px]">
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate block">
                {roomName || 'SyncCode'}
              </span>
              <span className="text-[10px] text-ide-muted block -mt-0.5 font-mono truncate">
                {roomId}
              </span>
            </div>
          </button>

          <span className="h-4 w-[1px] bg-ide-border hidden sm:block" />

          {/* Connection Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ide-surface border border-ide-border text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-400 animate-ping'
                  : 'bg-red-400'
              }`}
            />
            <span className="font-medium capitalize text-ide-muted">{connectionStatus}</span>
          </div>
        </div>

        {/* Center: Collaborators Avatar Pill */}
        <div className="hidden md:flex items-center space-x-1.5 bg-ide-surface/70 px-2.5 py-1 rounded-full border border-ide-border">
          <div className="flex -space-x-1.5 overflow-hidden">
            {connectedUsers.slice(0, 5).map((peer, i) => (
              <div
                key={peer.socketId || i}
                title={`${peer.displayName} (${peer.isGuest ? 'Guest' : 'Member'})`}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-ide-sidebar ring-1 ring-black/40 shadow-sm"
                style={{ backgroundColor: peer.color || '#3b82f6' }}
              >
                {peer.displayName?.charAt(0)?.toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-ide-muted pl-1">
            {connectedUsers.length} online
          </span>
        </div>

        {/* Right: Actions (Run, Save, Share, Settings, Leave) */}
        <div className="flex items-center space-x-2">
          
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow-emerald transition-all cursor-pointer"
          >
            {isRunning ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">Run Code</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            title="Save Document"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-ide-surface hover:bg-ide-active text-white text-xs font-medium flex items-center gap-1.5 border border-ide-border transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Share Room Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            title="Preferences"
            className="p-2 rounded-lg bg-ide-surface hover:bg-ide-active text-ide-muted hover:text-white border border-ide-border transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Leave Session */}
          <button
            onClick={() => navigate('/dashboard')}
            title="Leave Session"
            className="p-2 rounded-lg hover:bg-red-500/10 text-ide-muted hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Workspace Body: Left Sidebars + Monaco Editor + Bottom Output */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Leftmost Activity Bar Icons */}
        <div className="w-12 bg-ide-bg border-r border-ide-border flex flex-col items-center py-3 space-y-3 shrink-0">
          <button
            onClick={() => setSidebarTab(sidebarTab === 'files' ? 'none' : 'files')}
            title="Explorer"
            className={`p-2.5 rounded-xl transition-all ${
              sidebarTab === 'files'
                ? 'bg-blue-600 text-white shadow-glow'
                : 'text-ide-muted hover:text-white hover:bg-ide-surface'
            }`}
          >
            <FolderTree className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSidebarTab(sidebarTab === 'collaborators' ? 'none' : 'collaborators')}
            title="Collaborators"
            className={`p-2.5 rounded-xl transition-all relative ${
              sidebarTab === 'collaborators'
                ? 'bg-blue-600 text-white shadow-glow'
                : 'text-ide-muted hover:text-white hover:bg-ide-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <button
            onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')}
            title="Room Chat"
            className={`p-2.5 rounded-xl transition-all relative ${
              sidebarTab === 'chat'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-ide-muted hover:text-white hover:bg-ide-surface'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {roomMessages.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>

          <div className="flex-1" />

          {/* Quick Copy & Download Action Buttons */}
          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-2.5 rounded-xl text-ide-muted hover:text-white hover:bg-ide-surface transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadFile}
            title="Download File"
            className="p-2.5 rounded-xl text-ide-muted hover:text-white hover:bg-ide-surface transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Sidebar Drawer */}
        {sidebarTab !== 'none' && (
          <div className="w-64 sm:w-72 shrink-0 h-full border-r border-ide-border animate-in slide-in-from-left duration-150">
            {sidebarTab === 'files' && (
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
              />
            )}
            {sidebarTab === 'collaborators' && (
              <CollaboratorsList
                users={connectedUsers}
                currentUser={user}
                roomId={roomId}
              />
            )}
            {sidebarTab === 'chat' && (
              <ChatPanel
                messages={roomMessages}
                onSendMessage={handleSendMessage}
                currentUser={user}
              />
            )}
          </div>
        )}

        {/* Central Editor and Output Panel Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-ide-bg">
          
          {/* File Tab Bar */}
          <div className="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {files.map((file) => {
                const isActive = file.fileId === activeFileId;
                return (
                  <button
                    key={file.fileId}
                    onClick={() => handleSelectFile(file.fileId)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-t-lg text-xs font-mono transition-colors ${
                      isActive
                        ? 'bg-ide-bg text-white border-t-2 border-blue-500 font-semibold'
                        : 'text-ide-muted hover:bg-ide-surface/50 hover:text-white'
                    }`}
                  >
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center gap-1.5 bg-ide-surface px-2.5 py-1 rounded-lg border border-ide-border">
                <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <select
                  value={currentLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-white font-mono text-[11px] font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-ide-surface text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setOutputOpen(!outputOpen)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  outputOpen ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-ide-muted hover:text-white bg-ide-surface border border-ide-border'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Panel</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={currentLang}
              theme={theme}
              onMount={handleEditorDidMount}
              options={{
                fontSize: fontSize,
                tabSize: tabSize,
                minimap: { enabled: minimap },
                wordWrap: wordWrap,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                formatOnType: true,
                fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, monospace",
                fontLigatures: true,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Collapsible Bottom Output Panel */}
          {outputOpen && (
            <div className="h-56 sm:h-64 shrink-0">
              <OutputPanel
                outputData={outputData}
                isRunning={isRunning}
                activeLanguage={currentLang}
                currentCode={editorRef.current?.getValue() || ''}
                logs={roomLogs}
                onClear={() => setOutputData(null)}
                onClose={() => setOutputOpen(false)}
              />
            </div>
          )}

          {/* Status Bar */}
          <div className="h-6 bg-ide-sidebar border-t border-ide-border px-3 flex items-center justify-between text-[11px] text-ide-muted shrink-0">
            <div className="flex items-center space-x-3 font-mono">
              <span>UTF-8</span>
              <span>•</span>
              <span>{currentLang}</span>
              <span>•</span>
              <span>Spaces: {tabSize}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> CRDT Ready
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomId={roomId}
        roomName={`Workspace #${roomId}`}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};

export default EditorPage;
