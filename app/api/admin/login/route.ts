import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyPassword, getAdminPasswordHash, createAdminSession,
  getClientIp, assertSameOriginJson, rateLimit, logServerError,
  ERR_GENERIC, ERR_RATE,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  if (!assertSameOriginJson(req)) {
    return NextResponse.json({ ok: false, error: 'داواکاری نایاسایی' }, { status: 403 });
  }
  const ip = getClientIp(req);
  // brute-force lockout: 5 attempts / 15 min / IP
  if (!rateLimit('login', ip, 5, 15 * 60_000)) {
    return NextResponse.json({ ok: false, error: ERR_RATE }, { status: 429 });
  }
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'تکایە وشەی نهێنی بنووسە' }, { status: 400 });
    }
    const stored = await getAdminPasswordHash();
    if (!stored || !verifyPassword(parsed.data.password, stored)) {
      // identical message for wrong password — never reveal which part failed
      return NextResponse.json({ ok: false, error: 'وشەی نهێنی هەڵەیە' }, { status: 401 });
    }
    const session = await createAdminSession(ip, req.headers.get('user-agent') ?? '');
    return NextResponse.json({
      ok: true,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (e) {
    logServerError('login', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
