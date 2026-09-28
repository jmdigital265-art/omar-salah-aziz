'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useSite } from './site-context';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSite();
  const dark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? 'گۆڕین بۆ ڕووناکی' : 'گۆڕین بۆ تاریکی'}
      title={dark ? 'ڕووناک' : 'تاریک'}
      className="glass relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-transform duration-300 ease-out-expo hover:scale-110 active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -120 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 120 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          {dark ? (
            <Moon className="h-5 w-5 text-indigo-300" aria-hidden />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" aria-hidden />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
