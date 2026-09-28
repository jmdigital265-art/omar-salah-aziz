'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Share2, UserRound } from 'lucide-react';
import TiltCard from './tilt-card';
import { useSite } from './site-context';
import { platformDef } from './platforms';

/* Hero: 3D tilting portrait with a rotating conic ring + floating chips,
   greeting/name/title/tagline and quick social links. */

const entrance = (delay: number) => ({
  initial: { opacity: 0, y: 46, rotateX: -24 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  const { t, socials } = useSite();
  const photo = t('photo_url') || '/avatar.svg';

  const quick = socials.filter((s) => s.visible).slice(0, 6);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20">
      {/* 3D perspective grid floor */}
      <div className="hero-grid" style={{ perspective: '680px', transformStyle: 'preserve-3d' }} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-4 md:grid-cols-2 md:gap-8">
        {/* text column */}
        <div className="order-2 text-center md:order-1 md:text-right">
          <motion.span {...entrance(2.0)} className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold text-indigo-500 dark:text-indigo-300">
            <Sparkle /> {t('hero_greeting')}
          </motion.span>

          <motion.h1
            {...entrance(2.12)}
            className="font-kufi mt-5 text-4xl leading-[1.35] font-extrabold text-balance sm:text-5xl md:text-[3.4rem]"
          >
            {t('hero_name')}
          </motion.h1>

          <motion.p {...entrance(2.24)} className="text-brand-gradient mt-3 text-xl font-extrabold md:text-2xl">
            {t('hero_title')}
          </motion.p>

          <motion.p {...entrance(2.36)} className="font-naskh mx-auto mt-5 max-w-xl text-[15.5px] text-muted-foreground md:mx-0">
            {t('hero_tagline')}
          </motion.p>

          <motion.div {...entrance(2.48)} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a href="#socials" className="btn-primary text-[14.5px]">
              <Share2 className="h-4.5 w-4.5" aria-hidden />
              شوێنم کەوە
            </a>
            <a href="#about" className="btn-ghost text-[14.5px]">
              <UserRound className="h-4.5 w-4.5" aria-hidden />
              دەربارەی من
            </a>
          </motion.div>

          {quick.length > 0 && (
            <motion.div {...entrance(2.6)} className="mt-8 flex items-center justify-center gap-2.5 md:justify-start">
              {quick.map((s) => {
                const def = platformDef(s.platform);
                const Icon = def.icon;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label || def.label}
                    aria-label={s.label || def.label}
                    className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:scale-110"
                    style={{ ['--tint' as string]: def.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = def.color;
                      e.currentTarget.style.boxShadow = `0 8px 26px -8px ${def.color}88`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* portrait column */}
        <motion.div
          className="order-1 flex justify-center md:order-2"
          initial={{ opacity: 0, scale: 0.7, y: 60, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
          transition={{ delay: 2.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {/* floating orbit dots */}
            <motion.div
              className="pointer-events-none absolute -inset-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            >
              {[0, 120, 240].map((deg) => (
                <span
                  key={deg}
                  className="absolute top-1/2 right-1/2 h-2.5 w-2.5 rounded-full"
                  style={{
                    background: ['#818cf8', '#c084fc', '#f0abfc'][deg / 120],
                    transform: `rotate(${deg}deg) translateX(180px)`,
                    boxShadow: '0 0 14px currentColor',
                  }}
                />
              ))}
            </motion.div>

            <TiltCard intensity={14} lift={30} className="w-[270px] sm:w-[320px]">
              <div className="portrait-ring preserve-3d relative aspect-square rounded-[2.2rem]">
                <div className="glass-strong h-full w-full overflow-hidden rounded-[2.2rem] p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={t('hero_name')}
                    className="h-full w-full rounded-[1.75rem] object-cover"
                    draggable={false}
                  />
                </div>

                {/* floating name chip (3D pop) */}
                <motion.div
                  className="glass-strong absolute -bottom-5 right-6 rounded-2xl px-4 py-2 shadow-xl"
                  style={{ transform: 'translateZ(60px)' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.7, duration: 0.7 }}
                >
                  <p className="text-[13px] font-extrabold" dir="ltr" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    {t('brand_name_en')}
                  </p>
                </motion.div>
              </div>
            </TiltCard>
          </div>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.a
        href="#about"
        className="absolute bottom-6 right-1/2 translate-x-1/2 text-muted-foreground"
        animate={{ y: [0, 8, 0] }}
        transition={{ delay: 3.1, duration: 1.8, repeat: Infinity }}
        initial={{ opacity: 0 }}
        aria-label="بەرەو خوارەوە"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.a>
    </section>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  );
}
