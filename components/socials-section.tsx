'use client';

import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import TiltCard from './tilt-card';
import SectionHeader from './section-header';
import { useSite } from './site-context';
import { platformDef } from './platforms';

export default function SocialsSection() {
  const { socials } = useSite();
  const visible = socials.filter((s) => s.visible);

  return (
    <section id="socials" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
      <SectionHeader
        title="سۆشیال میدیا"
        hint="لە هەموو شوێنێک"
        icon={<Share2 className="h-3.5 w-3.5" aria-hidden />}
      />

      {visible.length === 0 ? (
        <motion.p
          className="font-naskh text-center text-[15px] text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          هێشتا هیچ لینکێکی سۆشیال میدیا زیاد نەکراوە — بەڕێوەبەر دەتوانێت لە پانێڵەوە زیادیان بکات.
        </motion.p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((s, i) => {
            const def = platformDef(s.platform);
            const Icon = def.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 60, rotateX: -40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: (i % 4) * 0.09, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={16} lift={26} className="h-full">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-strong group preserve-3d relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-3xl p-7 transition-shadow duration-500"
                    style={{ ['--tint' as string]: def.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 22px 55px -18px ${def.color}99`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* brand wash revealed on hover */}
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `radial-gradient(75% 75% at 50% 0%, ${def.color}22, transparent 70%)` }}
                      aria-hidden
                    />

                    <span
                      className="preserve-3d flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-500 ease-out-expo group-hover:scale-110"
                      style={{
                        transform: 'translateZ(42px)',
                        background: `${def.color}1f`,
                        border: `1px solid ${def.color}45`,
                      }}
                    >
                      <Icon className="h-8 w-8" />
                    </span>

                    <span className="relative text-[15px] font-extrabold" style={{ transform: 'translateZ(26px)' }}>
                      {s.label || def.label}
                    </span>

                    <span
                      className="text-[11.5px] font-bold tracking-wide opacity-70"
                      style={{ transform: 'translateZ(18px)', color: def.color }}
                    >
                      کردار →
                    </span>
                  </a>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
