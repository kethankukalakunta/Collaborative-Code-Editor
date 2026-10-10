import React, { useState } from 'react';
import { 
  FileCode, 
  FilePlus, 
  Trash2, 
  Edit3, 
  Folder, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  FileJson,
  Code
} from 'lucide-react';

const getFileIcon = (fileName = '') => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'cpp':
    case 'c':
    case 'h':
      return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
    case 'java':
      return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
    case 'html':
      return <Code className="w-4 h-4 text-red-400 shrink-0" />;
    case 'css':
      return <Code className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-amber-300 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-indigo-300 shrink-0" />;
    default:
      return <FileCode className="w-4 h-4 text-ide-muted shrink-0" />;
  }
};

const FileExplorer = ({ files, activeFileId, onSelectFile, onCreateFile, onDeleteFile, onRenameFile }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const startRename = (e, file) => {
    e.stopPropagation();
    setEditingFileId(file.fileId);
    setRenameValue(file.name);
  };

  const handleRenameSubmit = (e, fileId) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameFile(fileId, renameValue.trim());
      setEditingFileId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-ide-sidebar border-r border-ide-border select-none text-xs">
      
      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ide-border">
        <span className="font-semibold uppercase tracking-wider text-ide-muted text-[11px]">
          Explorer / Files
        </span>
        <button
          onClick={() => setIsCreating(true)}
          title="New File"
          className="p-1 rounded hover:bg-ide-surface text-ide-muted hover:text-white transition-colors"
        >
          <FilePlus className="w-4 h-4" />
        </button>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        
        {/* Project Folder Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-ide-muted font-medium text-[11px]">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span>workspace_src</span>
        </div>

        {/* New File Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="flex items-center px-2 py-1">
            <FileCode className="w-4 h-4 text-blue-400 shrink-0 mr-1.5" />
            <input
              type="text"
              autoFocus
              placeholder="filename.ext"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => !newFileName && setIsCreating(false)}
              className="w-full bg-ide-bg border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
            />
          </form>
        )}

        {/* File items */}
        {files.map((file) => {
          const isActive = file.fileId === activeFileId;
          const isRenaming = file.fileId === editingFileId;

          return (
            <div
              key={file.fileId}
              onClick={() => onSelectFile(file.fileId)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-white font-medium border border-blue-500/30'
                  : 'text-ide-muted hover:bg-ide-surface hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(file.name)}
                {isRenaming ? (
                  <form onSubmit={(e) => handleRenameSubmit(e, file.fileId)} className="flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => setEditingFileId(null)}
                      className="w-full bg-ide-bg border border-blue-500 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                    />
                  </form>
                ) : (
                  <span className="truncate text-xs">{file.name}</span>
                )}
              </div>

              {/* Action buttons (Rename, Delete) */}
              {!isRenaming && (
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => startRename(e, file)}
                    title="Rename"
                    className="p-1 hover:text-blue-400 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.fileId);
                      }}
                      title="Delete"
                      className="p-1 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileExplorer;
