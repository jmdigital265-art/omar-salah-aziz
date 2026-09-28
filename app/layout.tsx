import type { Metadata, Viewport } from 'next';
import { Noto_Kufi_Arabic, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-kufi',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-naskh',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const SITE_NAME = 'عومەر ساڵح عەزیز';
const SITE_DESCRIPTION = 'ماڵپەری کەسی عومەر ساڵح عەزیز — دەربارەی من و هەموو ڕێگاکانی پەیوەندیم لە یەک شوێندا.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'https://omar-salah-aziz.netlify.app'),
  title: {
    default: `${SITE_NAME} | ماڵپەری کەسی`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['عومەر ساڵح عەزیز', 'Omar Salah Aziz', 'کوردی', 'هەولێر', 'ماڵپەری کەسی'],
  openGraph: {
    type: 'website',
    locale: 'ckb_IQ',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ماڵپەری کەسی`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ماڵپەری کەسی`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0c12' },
    { media: '(prefers-color-scheme: light)', color: '#f8f7ff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/* Applied before first paint — prevents a theme flash on load. */
const themeBootstrap = `
(function () {
  try {
    var t = localStorage.getItem('omar-theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ku" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${kufi.variable} ${naskh.variable} min-h-screen font-kufi`}>
        {children}
      </body>
    </html>
  );
}
