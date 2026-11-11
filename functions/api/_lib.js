/* ==========================================================================
   Shared helpers for the CV request / approval / download API.
   Files and folders starting with "_" are not routed by Cloudflare Pages.
   ========================================================================== */

export const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

export const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
};

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

export function badRequest(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

/* ---------- base64url ---------- */
const enc = new TextEncoder();

function bytesToB64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ---------- HMAC-signed tokens ---------- */
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
}

export async function signToken(payload, secret) {
  const data = bytesToB64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${bytesToB64url(new Uint8Array(sig))}`;
}

export async function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), enc.encode(data));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(data)));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomId(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- request parsing ---------- */
export async function readJson(request) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ---------- KV access ---------- */
export function kv(env) {
  return env.CV_KV || null;
}

export async function kvGetJson(store, key) {
  if (!store) return null;
  const raw = await store.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function kvPutJson(store, key, value, opts) {
  if (!store) return;
  await store.put(key, JSON.stringify(value), opts);
}

/* ---------- optional email notification ----------
   Configure MAIL_API_KEY + MAIL_FROM (+ NOTIFY_EMAIL) to enable. Uses the
   Resend HTTP API shape; swap the URL for another provider if needed.
   If unconfigured this is a no-op so the API still works without email. */
export async function sendMail(env, { to, subject, html }) {
  if (!env.MAIL_API_KEY || !env.MAIL_FROM || !to) return { skipped: true };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.MAIL_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, html }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/* ---------- optional Turnstile verification ---------- */
export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // not configured → skip
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: form,
  });
  const data = await res.json().catch(() => ({}));
  return !!data.success;
}
