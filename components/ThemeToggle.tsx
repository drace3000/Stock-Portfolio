/**
 * components/ThemeToggle.tsx
 * 
 * Theme toggle component for switching between dark and light modes.
 * 
 * Features:
 * - Defaults to dark mode
 * - Persists theme preference in localStorage
 * - Smooth icon transitions (Sun/Moon)
 * - Updates HTML class to enable Tailwind dark mode
 * - Hover and tap animations
 * 
 * The component manages the 'dark' class on the document element,
 * which is used by Tailwind CSS to apply dark mode styles.
 */

'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ThemeToggle Component
 * 
 * Provides a button to toggle between dark and light themes.
 * 
 * How it works:
 * 1. Checks localStorage for saved theme preference on mount
 * 2. Defaults to dark mode if no preference is saved
 * 3. Updates HTML class and localStorage when theme changes
 * 4. Persists preference across page reloads
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check localStorage first, default to dark if not set
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === null ? true : savedTheme === 'dark'; // Default to dark
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-3 rounded-xl glass-card hover:shadow-soft-lg transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </motion.button>
  );
}

