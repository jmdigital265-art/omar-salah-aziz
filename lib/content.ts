import { db } from '@/lib/db';

/* ═══════════════════════════════════════════════════════════════
   Editable site content — every string the public site shows lives
   here as a key/value pair in the `omar_content` table. Defaults
   below are used on first boot; the admin panel can change them.
   ═══════════════════════════════════════════════════════════════ */

export type ContentMap = Record<string, string>;

export const DEFAULT_CONTENT: ContentMap = {
  brand_name: 'عومەر ساڵح عەزیز',
  brand_name_en: 'Omar Salah Aziz',
  hero_greeting: 'بسڵاو، من',
  hero_name: 'عومەر ساڵح عەزیز',
  hero_title: 'ماڵپەری کەسی',
  hero_tagline: 'چیرۆکەکەم، بیرۆکەکانم و هەموو ڕێگاکانی پەیوەندیم لێرە کۆکراونەتەوە — بەخێربێن.',
  about_title: 'دەربارەی من',
  about_text: [
    'ناوم عومەر ساڵح عەزیزە. ئەم ماڵپەرە پەنجەرەیەکە بۆ ناسینی من — کارەکانم، بیرۆکەکانم و ئەو شتانەی کە خۆشمدەوێت.',
    'بۆ ئەوەی زیاتر لە من بزانیت یان پەیوەندیم پێوە بکەیت، لە ڕێگەکانی سەرەوە و لینکەکانی سۆشیال میدیا هەموو کاتێک لە خزمەتدام.',
  ].join('\n\n'),
  photo_url: '',
  contact_email: '',
  contact_phone: '',
  contact_location: 'هەولێر، کوردستان',
  footer_note: 'سوپاس بۆ سەردانکردنی ماڵپەرەکەم 🤍',
};

/** Keys an admin may write (never includes `admin_password_hash`). */
export const EDITABLE_KEYS = Object.keys(DEFAULT_CONTENT);

export async function getContent(): Promise<ContentMap> {
  try {
    const rows = await db.siteContent.findMany({ where: { key: { in: EDITABLE_KEYS } } });
    return { ...DEFAULT_CONTENT, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}

export type PublicSocial = {
  id: string;
  platform: string;
  url: string;
  label: string;
  order: number;
  visible: boolean;
};

export async function getSocials(includeHidden = false): Promise<PublicSocial[]> {
  try {
    const rows = await db.socialLink.findMany({
      where: includeHidden ? {} : { visible: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.id, platform: r.platform, url: r.url, label: r.label, order: r.order, visible: r.visible,
    }));
  } catch {
    return [];
  }
}
