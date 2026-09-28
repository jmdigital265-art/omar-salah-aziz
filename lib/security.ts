import crypto from 'crypto';
import { db } from '@/lib/db';

/* ═══════════════════════════════════════════════════════════════
   Security core — عومەر ساڵح عەزیز personal site
   - scrypt password hashing (timing-safe verification)
   - DB-backed admin sessions (only HMAC token hashes are persisted)
   - in-memory rate limiting / lockout
   - same-origin (CSRF) checks
   ═══════════════════════════════════════════════════════════════ */

export const ERR_GENERIC = 'هەڵەیەکی ناوەکی ڕوویدا — تکایە دووبارە هەوڵ بدە';
export const ERR_RATE = 'هەوڵی زۆر — تکایە ١٥ خولەک چاوەڕێ بکە';

/* ---------- password hashing (scrypt) ---------- */

function parseScrypt(stored: string): { N: number; r: number; p: number; salt: Buffer; hash: Buffer } | null {
  try {
    const [algo, n, r, p, saltHex, hashHex] = stored.split('$');
    if (algo !== 'scrypt' || !n || !r || !p || !saltHex || !hashHex) return null;
    return {
      N: parseInt(n, 10), r: parseInt(r, 10), p: parseInt(p, 10),
      salt: Buffer.from(saltHex, 'hex'), hash: Buffer.from(hashHex, 'hex'),
    };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const N = 16384, r = 8, p = 1;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N, r, p });
  return ['scrypt', N, r, p, salt.toString('hex'), hash.toString('hex')].join('$');
}

/** Constant-time password verification against a stored scrypt hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const parsed = parseScrypt(stored);
  if (!parsed) return false;
  const candidate = crypto.scryptSync(password, parsed.salt, parsed.hash.length, {
    N: parsed.N, r: parsed.r, p: parsed.p,
  });
  return candidate.length === parsed.hash.length && crypto.timingSafeEqual(candidate, parsed.hash);
}

/* ---------- admin password resolution (DB hash → env bootstrap) ---------- */

/** Returns the active admin password hash from the DB. When none exists yet,
 *  the initial password from env is hashed and stored (first boot). */
export async function getAdminPasswordHash(): Promise<string | null> {
  const row = await db.siteContent.findUnique({ where: { key: 'admin_password_hash' } });
  if (row?.value) return row.value;
  const initial = process.env.INITIAL_ADMIN_PASSWORD;
  if (!initial || initial.length < 8) return null;
  const hashed = hashPassword(initial);
  try {
    await db.siteContent.upsert({
      where: { key: 'admin_password_hash' },
      update: {},
      create: { key: 'admin_password_hash', value: hashed },
    });
  } catch {
    /* concurrent first-boot — the winner's row is authoritative */
  }
  return hashed;
}

/* ---------- sessions ---------- */

const SESSION_TTL_HOURS = Math.max(1, parseInt(process.env.ADMIN_SESSION_TTL_HOURS ?? '12', 10) || 12);
const SESSION_PEPPER = process.env.SESSION_SECRET ?? 'omar-aziz-dev-pepper';

function hashToken(token: string): string {
  return crypto.createHmac('sha256', SESSION_PEPPER).update(token).digest('hex');
}

/** Create a new admin session. Returns the raw token (shown once, to the client) + expiry. */
export async function createAdminSession(ip: string, userAgent: string) {
  const raw = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000);
  await db.adminSession.create({
    data: { tokenHash: hashToken(raw), ip: ip.slice(0, 64), userAgent: userAgent.slice(0, 255), expiresAt },
  });
  try {
    await db.adminSession.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] },
    });
  } catch { /* best-effort */ }
  return { token: raw, expiresAt };
}

/** Resolve a raw session token to a live session, with sliding expiration. */
export async function resolveAdminSession(rawToken: string | null | undefined): Promise<{ id: string } | null> {
  if (!rawToken || rawToken.length < 20 || rawToken.length > 200) return null;
  try {
    const row = await db.adminSession.findUnique({ where: { tokenHash: hashToken(rawToken) } });
    if (!row || row.revoked) return null;
    if (row.expiresAt.getTime() < Date.now()) return null;
    if (Date.now() - row.lastSeen.getTime() > 3600_000) {
      await db.adminSession.update({
        where: { id: row.id },
        data: { lastSeen: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 3600_000) },
      });
    }
    return { id: row.id };
  } catch {
    return null;
  }
}

export async function revokeAdminSession(rawToken: string | null | undefined): Promise<void> {
  if (!rawToken) return;
  try {
    await db.adminSession.updateMany({ where: { tokenHash: hashToken(rawToken) }, data: { revoked: true } });
  } catch { /* best-effort */ }
}

/** Revoke every session (e.g. after a password change) except one. */
export async function revokeAllAdminSessions(keepSessionId?: string): Promise<void> {
  try {
    await db.adminSession.updateMany({
      where: keepSessionId ? { id: { not: keepSessionId } } : {},
      data: { revoked: true },
    });
  } catch { /* best-effort */ }
}

/* ---------- rate limiting (in-memory, per bucket+key) ---------- */

type Bucket = Map<string, number[]>;
const buckets = new Map<string, Bucket>();

let lastGc = Date.now();
function gcBuckets() {
  if (Date.now() - lastGc < 120_000) return;
  lastGc = Date.now();
  for (const [bucket, entries] of buckets) {
    for (const [key, hits] of entries) {
      if (hits.length === 0 || Date.now() - hits[hits.length - 1] > 3_600_000) entries.delete(key);
    }
    if (entries.size === 0) buckets.delete(bucket);
  }
}

/** Sliding-window limiter. Returns true when the action is ALLOWED. */
export function rateLimit(bucket: string, key: string, limit: number, windowMs: number): boolean {
  gcBuckets();
  const now = Date.now();
  let b = buckets.get(bucket);
  if (!b) { b = new Map(); buckets.set(bucket, b); }
  const hits = (b.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    b.set(key, hits);
    return false;
  }
  hits.push(now);
  b.set(key, hits);
  return true;
}

/* ---------- request helpers ---------- */

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'local';
}

/* ---------- write-request guard (CSRF) ---------- */

function urlHost(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Hosts this server is legitimately reached through: Host header plus
 *  any proxy-forwarded host (Netlify, load balancers…). */
function allowedHosts(req: Request): Set<string> {
  const fwd = req.headers.get('x-forwarded-host')?.split(',')[0].trim();
  return new Set(
    [req.headers.get('host'), fwd].filter((h): h is string => !!h).map((h) => h.toLowerCase())
  );
}

/** Guard for state-changing requests. Two independent CSRF layers:
 *
 *  1. JSON-only body — a cross-site <form> can never send
 *     `application/json`, and cross-site fetch() with that content-type
 *     triggers a CORS preflight this server never approves.
 *
 *  2. Origin/Referer host match — tolerant of proxy chains that rewrite
 *     the public URL (TLS termination, port changes, Host rewrites):
 *     exact host match → port-stripped hostname match → explicit
 *     ALLOWED_ORIGINS env allowlist → warn-and-allow, because writes
 *     remain protected by the unforgeable x-admin-token session header
 *     that cross-site pages cannot attach. */
export function assertSameOriginJson(req: Request): boolean {
  const ct = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (ct && ct !== 'application/json') return false;

  const src = req.headers.get('origin') ?? req.headers.get('referer');
  if (!src) return true; // non-browser client — the token still gates the write
  const srcHost = urlHost(src);
  if (!srcHost) return false;
  const hosts = allowedHosts(req);
  if (hosts.has(srcHost)) return true;

  const stripPort = (h: string) => h.replace(/:\d+$/, '');
  for (const h of hosts) {
    if (stripPort(h) === stripPort(srcHost)) return true;
  }

  const extra = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (extra.includes(srcHost)) return true;

  console.warn(`[csrf] write from unexpected origin ${srcHost} (hosts=${[...hosts].join(',')})`);
  return true;
}

/** Extract + validate the admin session token from the custom header.
 *  Custom headers are impossible for cross-site forms to attach and force
 *  a CORS preflight on cross-site fetch — the second CSRF layer. */
export async function requireAdmin(req: Request): Promise<{ id: string } | null> {
  const token = req.headers.get('x-admin-token');
  const session = await resolveAdminSession(token);
  if (!session) return null;
  if (!assertSameOriginJson(req)) return null;
  return session;
}

export function logServerError(where: string, e: unknown) {
  console.error(`[${where}]`, e instanceof Error ? e.message : e);
}
