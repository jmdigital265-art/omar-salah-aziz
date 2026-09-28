import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSocials } from '@/lib/content';
import { PLATFORM_IDS } from '@/components/platforms';
import { requireAdmin, logServerError, ERR_GENERIC } from '@/lib/security';
import { isSafeHttpUrl } from '@/lib/validate';

export const dynamic = 'force-dynamic';

/** GET /api/socials — public: visible links; admin token: all links. */
export async function GET(req: Request) {
  try {
    const admin = !!req.headers.get('x-admin-token');
    const socials = await getSocials(!admin ? false : true);
    return NextResponse.json({ ok: true, socials });
  } catch (e) {
    logServerError('socials-get', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}

const PostSchema = z.object({
  platform: z.string().refine((p) => (PLATFORM_IDS as string[]).includes(p), 'پلاتفۆرمی نەناسراو'),
  url: z.string().refine(isSafeHttpUrl, 'بەستەر دەبێت بە http یان https دەست پێبکات'),
  label: z.string().max(100).default(''),
  order: z.number().int().min(0).max(999).default(0),
  visible: z.boolean().default(true),
});

/** POST /api/socials — admin creates a link. */
export async function POST(req: Request) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'ڕێپێدراو نییە' }, { status: 401 });
  }
  try {
    const parsed = PostSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'داتای نایاسایی' },
        { status: 400 },
      );
    }
    const { platform, url, label, order, visible } = parsed.data;
    const row = await db.socialLink.create({
      data: { platform, url: url.trim(), label: label.trim(), order, visible },
    });
    return NextResponse.json({ ok: true, social: row });
  } catch (e) {
    logServerError('socials-post', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
