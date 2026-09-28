import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { PLATFORM_IDS } from '@/components/platforms';
import { requireAdmin, logServerError, ERR_GENERIC } from '@/lib/security';
import { isSafeHttpUrl } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const PutSchema = z.object({
  platform: z.string().refine((p) => (PLATFORM_IDS as string[]).includes(p), 'پلاتفۆرمی نەناسراو'),
  url: z.string().refine(isSafeHttpUrl, 'بەستەر دەبێت بە http یان https دەست پێبکات'),
  label: z.string().max(100).default(''),
  order: z.number().int().min(0).max(999).default(0),
  visible: z.boolean().default(true),
});

type Ctx = { params: { id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'ڕێپێدراو نییە' }, { status: 401 });
  }
  try {
    const parsed = PutSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'داتای نایاسایی' },
        { status: 400 },
      );
    }
    const { platform, url, label, order, visible } = parsed.data;
    const row = await db.socialLink.update({
      where: { id: params.id },
      data: { platform, url: url.trim(), label: label.trim(), order, visible },
    });
    return NextResponse.json({ ok: true, social: row });
  } catch (e) {
    logServerError('socials-put', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'ڕێپێدراو نییە' }, { status: 401 });
  }
  try {
    await db.socialLink.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logServerError('socials-delete', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
