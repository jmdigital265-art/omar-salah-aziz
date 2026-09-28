'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/* Section title with a 3D flip-in entrance shared by every section. */
export default function SectionHeader({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      className="perspective-800 mx-auto mb-12 max-w-2xl text-center"
      initial={{ opacity: 0, rotateX: -55, y: 34 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-bold text-indigo-500 dark:text-indigo-300">
        {icon ?? <Sparkles className="h-3.5 w-3.5" aria-hidden />}
        {hint ?? title}
      </span>
      <h2 className="font-kufi mt-4 text-3xl font-extrabold text-balance md:text-4xl">
        {title}
      </h2>
      <div className="bg-brand-gradient mx-auto mt-4 h-1 w-20 rounded-full opacity-80" />
    </motion.div>
  );
}
