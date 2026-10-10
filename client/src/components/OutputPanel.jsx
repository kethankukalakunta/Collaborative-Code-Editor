import React, { useState } from 'react';
import { Terminal, Globe, ListChecks, Trash2, X, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const OutputPanel = ({
  outputData,
  isRunning,
  activeLanguage,
  currentCode,
  logs = [],
  onClear,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal', 'preview', 'logs'

  return (
    <div className="flex flex-col h-full bg-ide-bg border-t border-ide-border text-xs">
      
      {/* Panel Tabs Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-ide-sidebar border-b border-ide-border">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'terminal'
                ? 'bg-ide-surface text-white font-medium shadow-sm'
                : 'text-ide-muted hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Terminal Output</span>
            {outputData && (
              <span className={`w-2 h-2 rounded-full ${outputData.exitCode === 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'preview'
                ? 'bg-ide-surface text-white font-medium shadow-sm'
                : 'text-ide-muted hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Web Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'logs'
                ? 'bg-ide-surface text-white font-medium shadow-sm'
                : 'text-ide-muted hover:text-white'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-purple-400" />
            <span>Room Logs</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {outputData && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-ide-muted mr-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {outputData.duration || '0ms'}
              </span>
              <span>•</span>
              <span className={outputData.exitCode === 0 ? 'text-emerald-400' : 'text-red-400'}>
                Exit Code: {outputData.exitCode ?? 0}
              </span>
            </div>
          )}

          <button
            onClick={onClear}
            title="Clear output"
            className="p-1 rounded hover:bg-ide-surface text-ide-muted hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            title="Close panel"
            className="p-1 rounded hover:bg-ide-surface text-ide-muted hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs">
        
        {/* 1. Terminal / Execution Output Tab */}
        {activeTab === 'terminal' && (
          <div className="h-full">
            {isRunning ? (
              <div className="flex items-center gap-2 text-ide-muted py-4">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <span>Executing code in isolated environment...</span>
              </div>
            ) : outputData ? (
              <div className="space-y-2">
                {outputData.stdout && (
                  <div className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {outputData.stdout}
                  </div>
                )}
                {outputData.stderr && (
                  <div className="text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 whitespace-pre-wrap leading-relaxed">
                    {outputData.stderr}
                  </div>
                )}
                {!outputData.stdout && !outputData.stderr && (
                  <div className="text-ide-muted italic">
                    (Execution finished with no output)
                  </div>
                )}
              </div>
            ) : (
              <div className="text-ide-muted text-center py-6">
                Click <strong className="text-emerald-400">"Run Code"</strong> in the top bar to execute and inspect output.
              </div>
            )}
          </div>
        )}

        {/* 2. Live Web Preview Tab */}
        {activeTab === 'preview' && (
          <div className="h-full w-full bg-white rounded-lg overflow-hidden border border-ide-border">
            <iframe
              title="Live HTML Preview"
              srcDoc={
                activeLanguage === 'html' || currentCode.includes('<html') || currentCode.includes('<div')
                  ? currentCode
                  : `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;color:#333;"><h3>Web Preview</h3><p>Current code is not HTML. Switch to an HTML file to preview rendered UI.</p></body></html>`
              }
              sandbox="allow-scripts"
              className="w-full h-full min-h-[160px] border-0"
            />
          </div>
        )}

        {/* 3. Room & Synchronization Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-1.5 font-sans">
            {logs.length === 0 ? (
              <div className="text-ide-muted text-center py-6">No activity logs recorded yet.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs py-1 border-b border-ide-border/50 text-ide-muted">
                  <span className="text-[10px] text-ide-muted font-mono">{log.time}</span>
                  <span className="text-white">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
