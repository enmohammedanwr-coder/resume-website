/* ==========================================================================
   Admin authentication helpers (server-side only).

   - Passwords are never shipped to the browser and never stored in the repo.
     Configure one of these environment variables on Cloudflare Pages:
       ADMIN_PASSWORD_HASH  = "pbkdf2$<iters>$<saltB64>$<hashB64>"   (preferred)
       ADMIN_PASSWORD       = plaintext (simpler, still server-side only)
     Generate the hash with:  python3 tools/admin/make-admin-hash.py
   - Sessions are random opaque ids stored in KV (`sess:<id>`) and carried in
     an HttpOnly, SameSite=Strict cookie. Nothing sensitive is returned to JS.
   - Files starting with "_" are not routed by Cloudflare Pages.
   ========================================================================== */
import { kvGetJson, kvPutJson, randomId, sha256Hex } from '../_lib.js';

export const COOKIE_NAME = 'cv_admin';
const DEFAULT_SESSION_TTL_HOURS = 12;
/* When the owner opts into a persistent session (SESSION_TTL_HOURS=0) the KV
   record gets no expiry and the cookie gets a far-future Max-Age. */
const FOREVER_COOKIE_MAX_AGE = 315360000; // 10 years
const enc = new TextEncoder();

/* Session lifetime in seconds; 0 means "never expire".
   Configure SESSION_TTL_HOURS on Cloudflare Pages to override the default. */
function sessionTtlSeconds(env) {
  const raw = env && env.SESSION_TTL_HOURS;
  if (raw === undefined || raw === null || raw === '') return DEFAULT_SESSION_TTL_HOURS * 3600;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_SESSION_TTL_HOURS * 3600;
  return n <= 0 ? 0 : Math.floor(n * 3600);
}

/* ---------- cookies ---------- */
export function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  const out = {};
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function sessionCookie(request, id, maxAgeSeconds) {
  const secure = new URL(request.url).protocol === 'https:';
  const age = maxAgeSeconds > 0 ? maxAgeSeconds : FOREVER_COOKIE_MAX_AGE;
  const parts = [
    `${COOKIE_NAME}=${id}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${age}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/* ---------- password verification ---------- */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(password, salt, iterations, length = 32) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, length * 8
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(env, password) {
  if (typeof password !== 'string' || !password) return false;

  if (env.ADMIN_PASSWORD_HASH) {
    const [scheme, itersStr, saltB64, hashB64] = String(env.ADMIN_PASSWORD_HASH).split('$');
    if (scheme !== 'pbkdf2' || !itersStr || !saltB64 || !hashB64) return false;
    const iterations = parseInt(itersStr, 10);
    const salt = b64ToBytes(saltB64);
    const expected = b64ToBytes(hashB64);
    let actual;
    try {
      actual = await pbkdf2(password, salt, iterations, expected.length);
    } catch {
      // Workers WebCrypto rejects PBKDF2 iteration counts above 100000.
      return false;
    }
    return timingSafeEqual(actual, expected);
  }

  if (env.ADMIN_PASSWORD) {
    const a = enc.encode(password);
    const b = enc.encode(String(env.ADMIN_PASSWORD));
    return timingSafeEqual(a, b);
  }

  return false;
}

export function adminConfigured(env) {
  return Boolean(env.ADMIN_PASSWORD_HASH || env.ADMIN_PASSWORD);
}

/* ---------- sessions ---------- */
export async function createSession(env, request) {
  const store = env.CV_KV;
  const id = randomId(32);
  const ip = request.headers.get('cf-connecting-ip') || '';
  const session = {
    id,
    createdAt: new Date().toISOString(),
    ua: (request.headers.get('user-agent') || '').slice(0, 200),
    ipHash: ip ? await sha256Hex(ip) : '',
  };
  const ttlSeconds = sessionTtlSeconds(env);
  if (store) {
    const opts = ttlSeconds > 0 ? { expirationTtl: ttlSeconds } : undefined;
    await kvPutJson(store, `sess:${id}`, session, opts);
  }
  return { id, ttlSeconds };
}

export async function requireSession(env, request) {
  const store = env.CV_KV;
  if (!store) return null;
  const id = parseCookies(request)[COOKIE_NAME];
  if (!id) return null;
  const session = await kvGetJson(store, `sess:${id}`);
  return session || null;
}

export async function destroySession(env, request) {
  const store = env.CV_KV;
  const id = parseCookies(request)[COOKIE_NAME];
  if (store && id) await store.delete(`sess:${id}`);
}

/* ---------- CSRF: only accept state-changing calls from our own origin ---------- */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin fetch may omit it; cookie+SameSite still apply
  try {
    const originHost = new URL(origin).host;
    // Behind a proxy the URL host can differ from the public Host header.
    const host = request.headers.get('host') || new URL(request.url).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/* ---------- best-effort login rate limit ---------- */
const LOGIN_MAX = 10;
const LOGIN_WINDOW_S = 15 * 60;

export async function loginRateLimited(env, request) {
  const store = env.CV_KV;
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!store || !ip) return false;
  const key = `loginrl:${await sha256Hex(ip)}`;
  const count = parseInt((await store.get(key)) || '0', 10);
  if (count >= LOGIN_MAX) return true;
  await store.put(key, String(count + 1), { expirationTtl: LOGIN_WINDOW_S });
  return false;
}

export async function clearLoginRate(env, request) {
  const store = env.CV_KV;
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (store && ip) await store.delete(`loginrl:${await sha256Hex(ip)}`);
}
