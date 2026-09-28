import { getContent, getSocials } from '@/lib/content';
import SiteShell from '@/components/site-shell';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [content, socials] = await Promise.all([getContent(), getSocials()]);
  return <SiteShell initialContent={content} initialSocials={socials} />;
}
