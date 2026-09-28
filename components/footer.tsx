'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { useSite } from './site-context';

/* Footer — the "J&M Digital" credit hides the admin door:
   5 quick clicks (within 2.2s windows) unlock the login modal. */

export default function Footer({ onSecretUnlock }: { onSecretUnlock: () => void }) {
  const { t } = useSite();
  const clicks = useRef<number[]>([]);
  const [charge, setCharge] = useState(0);

  const handleDevClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((c) => now - c < 2200), now];
    const n = clicks.current.length;
    setCharge(n);
    if (n >= 5) {
      clicks.current = [];
      setCharge(0);
      onSecretUnlock();
      return;
    }
    if (n >= 3) {
      setTimeout(() => setCharge((c) => (c === n ? 0 : c)), 2200);
    }
  };

  return (
    <footer className="relative mt-10 border-t border-[hsl(var(--border))]">
      <div className="bg-brand-gradient pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" aria-hidden />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-12 text-center">
        <motion.p
          className="font-naskh max-w-md text-[14px] text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {t('footer_note')}
        </motion.p>

        {/* QR code — scan to open the site on a phone */}
        <motion.div
          className="perspective-800 flex flex-col items-center gap-3"
          initial={{ opacity: 0, rotateX: -35, y: 30 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass preserve-3d group rounded-2xl p-2.5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_16px_38px_-14px_rgba(139,92,246,0.55)]">
            <div className="rounded-xl bg-white p-2 shadow-inner" style={{ transform: 'translateZ(24px)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qr-code.svg"
                alt={t('footer_qr_hint')}
                className="h-24 w-24 sm:h-28 sm:w-28"
                draggable={false}
                loading="lazy"
              />
            </div>
          </div>
          <p className="text-[12px] font-bold text-muted-foreground">{t('footer_qr_hint')}</p>
        </motion.div>

        <div className="h-px w-40 bg-gradient-to-r from-transparent via-[hsl(var(--border))] to-transparent" aria-hidden />

        <div className="flex flex-col items-center gap-2">
          <p className="text-[12.5px] text-muted-foreground">
            © {new Date().getFullYear()}{' '}
            <span className="font-bold text-foreground">{t('brand_name')}</span>
            {' — '}{t('footer_rights')}
          </p>

          {/* developer credit — the secret admin door */}
          <button
            onClick={handleDevClick}
            className="group relative flex select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-muted-foreground transition-colors duration-300 hover:text-foreground"
            title={t('footer_credit', 'Developed by J&M Digital')}
            aria-label={t('footer_credit', 'Developed by J&M Digital')}
          >
            <Code2 className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
            <span dir="ltr" style={{ fontFamily: 'Tahoma, sans-serif' }}>
              {t('footer_credit', 'Developed by J&M Digital')}
            </span>

            {/* charge indicator (appears from the 3rd click) */}
            {charge > 0 && (
              <motion.span
                className="absolute -bottom-1 right-1/2 h-[3px] rounded-full bg-brand-gradient"
                initial={false}
                animate={{ width: `${(charge / 5) * 100}%`, x: `${(charge / 5) * 50}%` }}
                transition={{ duration: 0.25 }}
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
