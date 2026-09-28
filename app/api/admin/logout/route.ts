import { NextResponse } from 'next/server';
import { revokeAdminSession, logServerError, ERR_GENERIC } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await revokeAdminSession(req.headers.get('x-admin-token'));
  } catch (e) {
    logServerError('logout', e);
  }
  return NextResponse.json({ ok: true });
}
