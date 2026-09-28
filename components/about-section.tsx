'use client';

import { motion } from 'framer-motion';
import { BookOpenText } from 'lucide-react';
import SectionHeader from './section-header';
import { useSite } from './site-context';

export default function AboutSection() {
  const { t } = useSite();
  const paragraphs = (t('about_text') || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <section id="about" className="relative mx-auto max-w-4xl scroll-mt-24 px-4 py-24">
      <SectionHeader title={t('about_title')} hint="دەربارە" icon={<BookOpenText className="h-3.5 w-3.5" aria-hidden />} />

      <motion.div
        className="glass-strong perspective-1200 relative rounded-[2rem] p-8 shadow-xl shadow-indigo-500/5 md:p-12"
        initial={{ opacity: 0, rotateX: 22, y: 70 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
        viewport={{ once: true, margin: '-90px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* corner gradient accents */}
        <div className="bg-brand-gradient absolute top-0 right-8 h-1.5 w-24 rounded-b-full opacity-70" aria-hidden />
        <div className="bg-brand-gradient absolute bottom-0 left-8 h-1.5 w-24 rounded-t-full opacity-70" aria-hidden />

        <div className="font-naskh space-y-6 text-[15.5px] md:text-[16.5px]" style={{ transform: 'translateZ(30px)' }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: 34 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {p}
              </motion.p>
            ))
          ) : (
            <p className="text-muted-foreground">بێ ناوەڕۆک — لە پانێڵی بەڕێوەبەرەوە دەستکاری بکە.</p>
          )}
        </div>

        <motion.div
          className="mt-8 flex items-center gap-3"
          style={{ transform: 'translateZ(46px)' }}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="bg-brand-gradient h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-violet-500/30" aria-hidden />
          <div>
            <p className="text-[15px] font-extrabold">{t('hero_name')}</p>
            <p className="text-[12.5px] text-muted-foreground" dir="ltr" style={{ fontFamily: 'Tahoma, sans-serif' }}>
              {t('brand_name_en')}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
