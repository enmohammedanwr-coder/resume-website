/* ==========================================================================
   POST /api/cv-request
   A visitor asks to download the CV. We store the request and notify the
   owner, who approves it out of band (see cv-approve.js).
   ========================================================================== */
import {
  json, badRequest, readJson, isValidEmail, kv, kvGetJson, kvPutJson,
  randomId, sha256Hex, sendMail, verifyTurnstile,
} from './_lib.js';

const RATE_LIMIT = 6;          // requests per window per IP
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX = { name: 120, email: 160, reason: 600 };

function siteUrl(env, request) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  return new URL(request.url).origin;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const body = await readJson(request);
  if (!body) return badRequest('invalid_json');

  // Honeypot: real users never fill this hidden field.
  if (body.website) return json({ ok: true });

  const name = String(body.name || '').trim().slice(0, MAX.name);
  const email = String(body.email || '').trim().slice(0, MAX.email);
  const reason = String(body.reason || '').trim().slice(0, MAX.reason);
  const lang = body.lang === 'en' ? 'en' : 'ar';

  if (!name) return badRequest('name_required');
  if (!isValidEmail(email)) return badRequest('email_invalid');

  // Optional bot check (no-op unless TURNSTILE_SECRET is set).
  const ip = request.headers.get('cf-connecting-ip') || '';
  const okHuman = await verifyTurnstile(env, body.turnstileToken, ip);
  if (!okHuman) return badRequest('turnstile_failed', 403);

  const store = kv(env);
  const emailHash = await sha256Hex(email.toLowerCase());

  // Simple IP rate limit (best effort; skipped if KV is not configured).
  if (store && ip) {
    const rlKey = `rl:${await sha256Hex(ip)}`;
    const count = parseInt((await store.get(rlKey)) || '0', 10);
    if (count >= RATE_LIMIT) return badRequest('rate_limited', 429);
    await store.put(rlKey, String(count + 1), { expirationTtl: Math.ceil(RATE_WINDOW_MS / 1000) });
  }

  // If this email was already approved, return the existing token immediately.
  const approved = await kvGetJson(store, `approved:${emailHash}`);
  if (approved && approved.token) {
    return json({ ok: true, alreadyApproved: true, token: approved.token });
  }

  const id = randomId(12);
  const record = {
    id, name, email, emailHash, reason, lang,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ipHash: ip ? await sha256Hex(ip) : '',
    userAgent: (request.headers.get('user-agent') || '').slice(0, 200),
  };
  await kvPutJson(store, `req:${id}`, record);
  await kvPutJson(store, `email:${emailHash}`, { id, email, name, status: 'pending' });

  // Notify the owner (no-op if email is not configured).
  const base = siteUrl(env, request);
  const approveLink = `${base}/api/cv-approve?req=${id}&k=${encodeURIComponent(env.ADMIN_KEY || '')}`;
  const rejectLink = `${base}/api/cv-approve?req=${id}&k=${encodeURIComponent(env.ADMIN_KEY || '')}&action=reject`;
  await sendMail(env, {
    to: env.NOTIFY_EMAIL || (env.OWNER_EMAIL || ''),
    subject: `CV download request from ${name}`,
    html: `<h2>New CV download request</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Reason:</b> ${reason || '—'}</p>
      <p><b>Request ID:</b> ${id}</p>
      <p><a href="${approveLink}">✅ Approve &amp; send link</a> &nbsp;|&nbsp;
         <a href="${rejectLink}">⛔ Reject</a></p>`,
  });

  return json({ ok: true, id });
}

// Anything other than POST.
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' });
}
