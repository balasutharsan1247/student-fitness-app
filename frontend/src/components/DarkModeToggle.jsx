import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110
                 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-400 animate-in spin-in-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 animate-in spin-in-180 duration-500" />
      )}
    </button>
  );
};

export default DarkModeToggle;