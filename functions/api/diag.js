/* Temporary diagnostic endpoint — remove after debugging. */
import { json } from './_lib.js';
import { verifyPassword, adminConfigured, createSession, loginRateLimited } from './admin/_auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pw = url.searchParams.get('pw') || '';
  const out = {
    adminConfigured: adminConfigured(env),
    hashLen: (env.ADMIN_PASSWORD_HASH || '').length,
    hashPrefix: (env.ADMIN_PASSWORD_HASH || '').slice(0, 18),
    hashParts: (env.ADMIN_PASSWORD_HASH || '').split('$').length,
    kvType: typeof env.CV_KV,
  };
  try {
    out.verifyResult = await verifyPassword(env, pw);
  } catch (e) {
    out.verifyError = String(e && e.message ? e.message : e);
  }
  try {
    out.rateLimited = await loginRateLimited(env, request);
  } catch (e) {
    out.rateLimitError = String(e && e.message ? e.message : e);
  }
  try {
    const s = await createSession(env, request);
    out.sessionCreated = Boolean(s && s.id);
    out.sessionTtl = s && s.ttlSeconds;
  } catch (e) {
    out.sessionError = String(e && e.message ? e.message : e);
    out.sessionStack = String(e && e.stack ? e.stack : '').slice(0, 400);
  }
  return json(out);
}

