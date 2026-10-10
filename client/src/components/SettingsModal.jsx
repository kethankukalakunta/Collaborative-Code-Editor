import React from 'react';
import { X, Sliders, Type, Palette, Layout, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    tabSize,
    setTabSize,
    minimap,
    setMinimap,
    wordWrap,
    setWordWrap,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-ide-surface border border-ide-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ide-muted hover:text-white rounded-lg hover:bg-ide-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Editor Preferences</h3>
            <p className="text-xs text-ide-muted">Customize your Monaco coding experience</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" /> Editor Color Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-ide-bg border border-ide-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="vs-dark">VS Dark (Default)</option>
              <option value="light">VS Light</option>
              <option value="hc-black">High Contrast Black</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-ide-muted flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-400" /> Font Size: {fontSize}px
              </label>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-xs font-medium text-ide-muted mb-1.5 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-emerald-400" /> Indentation (Tab Size)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTabSize(2)}
                className={`py-2 rounded-xl font-medium border transition-colors ${
                  tabSize === 2
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-ide-bg border-ide-border text-ide-muted hover:text-white'
                }`}
              >
                2 Spaces
              </button>
              <button
                type="button"
                onClick={() => setTabSize(4)}
                className={`py-2 rounded-xl font-medium border transition-colors ${
                  tabSize === 4
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-ide-bg border-ide-border text-ide-muted hover:text-white'
                }`}
              >
                4 Spaces
              </button>
            </div>
          </div>

          {/* Toggles (Minimap, Word Wrap) */}
          <div className="pt-2 border-t border-ide-border space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-ide-muted flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-yellow-400" /> Show Editor Minimap
              </span>
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-ide-muted flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-cyan-400" /> Word Wrap
              </span>
              <input
                type="checkbox"
                checked={wordWrap === 'on'}
                onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
