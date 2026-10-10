import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('sync_editor_theme') || 'vs-dark');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('sync_editor_fontsize')) || 14);
  const [tabSize, setTabSize] = useState(() => Number(localStorage.getItem('sync_editor_tabsize')) || 2);
  const [minimap, setMinimap] = useState(() => localStorage.getItem('sync_editor_minimap') !== 'false');
  const [wordWrap, setWordWrap] = useState(() => localStorage.getItem('sync_editor_wordwrap') || 'on');

  useEffect(() => {
    localStorage.setItem('sync_editor_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sync_editor_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('sync_editor_tabsize', tabSize);
  }, [tabSize]);

  useEffect(() => {
    localStorage.setItem('sync_editor_minimap', minimap);
  }, [minimap]);

  useEffect(() => {
    localStorage.setItem('sync_editor_wordwrap', wordWrap);
  }, [wordWrap]);

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
