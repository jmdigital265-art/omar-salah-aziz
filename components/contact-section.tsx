'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import SectionHeader from './section-header';
import { useSite } from './site-context';

function Row({
  icon,
  label,
  value,
  href,
  ltr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  ltr?: boolean;
}) {
  if (!value) return null;
  const inner = (
    <motion.div
      className="glass flex w-full items-center gap-4 rounded-2xl p-5 transition-transform duration-400 ease-out-expo hover:-translate-y-1"
      initial={{ opacity: 0, y: 40, rotateY: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="bg-brand-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-500/35">
        {icon}
      </span>
      <span className="min-w-0 text-right">
        <span className="block text-[12px] font-bold text-muted-foreground">{label}</span>
        <span className="block truncate text-[14.5px] font-extrabold" dir={ltr ? 'ltr' : undefined}>
          {value}
        </span>
      </span>
    </motion.div>
  );
  return href ? (
    <a href={href} className="block" target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function ContactSection() {
  const { t } = useSite();
  const email = t('contact_email').trim();
  const phone = t('contact_phone').trim();

  return (
    <section id="contact" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-24">
      <SectionHeader title="پەیوەندیم پێوە بکە" hint="پەیوەندی" />

      <div className="space-y-4">
        <Row
          icon={<Mail className="h-5 w-5" aria-hidden />}
          label="ئیمەیڵ"
          value={email}
          href={email ? `mailto:${email}` : undefined}
          ltr
        />
        <Row
          icon={<Phone className="h-5 w-5" aria-hidden />}
          label="ژمارەی مۆبایل"
          value={phone}
          href={phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined}
          ltr
        />
        <Row
          icon={<MapPin className="h-5 w-5" aria-hidden />}
          label="ناونیشان"
          value={t('contact_location').trim()}
        />
      </div>

      {email || phone ? null : (
        <motion.p
          className="font-naskh mt-6 text-center text-[14.5px] text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          زانیاری پەیوەندی لە پانێڵی بەڕێوەبەرەوە ڕێکدەخرێت.
        </motion.p>
      )}
    </section>
  );
}
