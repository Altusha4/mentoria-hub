import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mentoria-theme');
      if (saved !== null) {
        return saved === 'dark';
      }
    }
    // Default to LIGHT theme
    return false;
  });

  // Apply theme to DOM on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mentoria-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mentoria-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
