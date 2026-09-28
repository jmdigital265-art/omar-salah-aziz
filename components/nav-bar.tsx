'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './theme-toggle';
import { useSite } from './site-context';

const LINKS = [
  { id: 'home', label: 'سەرەتا' },
  { id: 'about', label: 'دەربارە' },
  { id: 'socials', label: 'سۆشیال میدیا' },
  { id: 'contact', label: 'پەیوەندی' },
];

export default function NavBar() {
  const { t } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const ids = ['home', 'about', 'socials', 'contact'];
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.95, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <nav
          className={`glass flex items-center justify-between gap-3 rounded-2xl px-4 transition-all duration-500 ${
            scrolled ? 'py-2 shadow-lg shadow-indigo-500/10' : 'py-3'
          }`}
          aria-label="ناڤیگەیشنی سەرەکی"
        >
          <button
            onClick={() => go('home')}
            className="flex items-center gap-2.5"
            aria-label={t('brand_name')}
          >
            <span className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-base font-extrabold text-white shadow-md shadow-indigo-500/40">
              ع
            </span>
            <span className="hidden text-[15px] font-bold sm:block">{t('brand_name')}</span>
          </button>

          <ul className="flex items-center gap-0.5 sm:gap-1.5">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => go(l.id)}
                  className={`relative rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition-colors duration-300 sm:px-3.5 sm:text-[13.5px] ${
                    active === l.id
                      ? 'text-indigo-500 dark:text-indigo-300'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                  {active === l.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              </li>
            ))}
            <li className="mr-1 sm:mr-2">
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
