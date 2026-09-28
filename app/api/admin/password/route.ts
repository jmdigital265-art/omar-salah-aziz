import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  verifyPassword, getAdminPasswordHash, hashPassword,
  revokeAllAdminSessions, requireAdmin, rateLimit, getClientIp,
  logServerError, ERR_GENERIC, ERR_RATE,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(10, 'وشەی نهێنی دەبێت لانیکەم ١٠ پیت بێت').max(200),
});

export async function POST(req: Request) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'ڕێپێدراو نییە' }, { status: 401 });
  }
  const ip = getClientIp(req);
  if (!rateLimit('password', ip, 10, 15 * 60_000)) {
    return NextResponse.json({ ok: false, error: ERR_RATE }, { status: 429 });
  }
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'داتای نایاسایی' },
        { status: 400 },
      );
    }
    const stored = await getAdminPasswordHash();
    if (!stored || !verifyPassword(parsed.data.current, stored)) {
      return NextResponse.json({ ok: false, error: 'وشەی نهێنی ئێستا هەڵەیە' }, { status: 401 });
    }
    await db.siteContent.upsert({
      where: { key: 'admin_password_hash' },
      update: { value: hashPassword(parsed.data.next) },
      create: { key: 'admin_password_hash', value: hashPassword(parsed.data.next) },
    });
    // every other device is logged out after a password change
    await revokeAllAdminSessions(session.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    logServerError('password-change', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
