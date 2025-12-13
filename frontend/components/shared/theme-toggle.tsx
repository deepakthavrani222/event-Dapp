'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300
        ${isDark 
          ? 'bg-slate-700 border border-slate-600' 
          : 'bg-amber-100 border border-amber-200'
        }
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className={`w-4 h-4 transition-opacity ${isDark ? 'opacity-30 text-slate-400' : 'opacity-100 text-amber-500'}`} />
        <Moon className={`w-4 h-4 transition-opacity ${isDark ? 'opacity-100 text-slate-200' : 'opacity-30 text-amber-300'}`} />
      </div>
      
      {/* Sliding circle */}
      <motion.div
        className={`
          w-5 h-5 rounded-full shadow-md flex items-center justify-center
          ${isDark 
            ? 'bg-slate-900' 
            : 'bg-white'
          }
        `}
        animate={{
          x: isDark ? 26 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-blue-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
