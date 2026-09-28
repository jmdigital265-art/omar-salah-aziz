import { NextResponse } from 'next/server';
import { resolveAdminSession, logServerError, ERR_GENERIC } from '@/lib/security';

export const dynamic = 'force-dynamic';

/** GET /api/admin/session — lightweight check used by the client on load
 *  to validate a stored token against the live session table. */
export async function GET(req: Request) {
  try {
    const session = await resolveAdminSession(req.headers.get('x-admin-token'));
    return NextResponse.json({ ok: true, valid: !!session });
  } catch (e) {
    logServerError('session-check', e);
    return NextResponse.json({ ok: false, error: ERR_GENERIC }, { status: 500 });
  }
}
