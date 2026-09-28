import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getContent, getSocials, EDITABLE_KEYS } from '@/lib/content';
import { requireAdmin, rateLimit, getClientIp, logServerError, ERR_GENERIC } from '@/lib/security';
import { isSafeImageValue } from '@/lib/validate';

export const dynamic = 'force-dynamic';

/** GET /api/content — public snapshot of all editable text + visible socials. */
export async function GET() {
  try {
    const [content, socials] = await Promise.all([getContent(), getSocials()]);
    return NextResponse.json({ ok: true, content, socials });
  } catch (e) {
    logServerError('content-get', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}

const LIMITS: Record<string, number> = {
  photo_url: 1_050_001,
  about_text: 6000,
};

const PutSchema = z.object({
  updates: z.record(z.string().max(64), z.string().max(1_100_000)),
});

/** PUT /api/content — admin batch update of editable keys. */
export async function PUT(req: Request) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'ڕێپێدراو نییە' }, { status: 401 });
  }
  if (!rateLimit('content-write', getClientIp(req), 60, 60_000)) {
    return NextResponse.json({ ok: false, error: 'داواکاری زۆر — چەند چرکەیەک چاوەڕێ بکە' }, { status: 429 });
  }
  try {
    const parsed = PutSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'داتای نایاسایی' }, { status: 400 });
    }
    const entries = Object.entries(parsed.data.updates).filter(([k]) => EDITABLE_KEYS.includes(k));
    for (const [key, value] of entries) {
      if (value.length > (LIMITS[key] ?? 600)) {
        return NextResponse.json({ ok: false, error: `ناوەڕۆکی ${key} زۆر درێژە` }, { status: 400 });
      }
      if (key === 'photo_url' && value && !isSafeImageValue(value)) {
        return NextResponse.json(
          { ok: false, error: 'وێنە نایاساییە — تکایە وێنەیەکی بچووکتر هەڵبژێرە' },
          { status: 400 },
        );
      }
    }
    for (const [key, value] of entries) {
      await db.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    const [content, socials] = await Promise.all([getContent(), getSocials()]);
    return NextResponse.json({ ok: true, content, socials });
  } catch (e) {
    logServerError('content-put', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
