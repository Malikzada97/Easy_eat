
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { SunIcon, MoonIcon } from '../../constants';
import { AppContextType } from '../../types';

const ThemeToggle: React.FC = () => {
  // FIX: Explicitly type the context after null check to prevent type errors.
  const context = useContext(AppContext) as AppContextType | null;
  if (!context) return null;

  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-light-text dark:text-dark-text bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;