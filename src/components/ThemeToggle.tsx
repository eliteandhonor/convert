import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed top-4 right-4 p-2 rounded-full bg-matrix-800 
        hover:bg-matrix-700 transition-colors z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-6 h-6 text-matrix-glow" />
      ) : (
        <MoonIcon className="w-6 h-6 text-matrix-glow" />
      )}
    </motion.button>
  );
}