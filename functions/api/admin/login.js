/* ==========================================================================
   POST /api/admin/login   { password }
   Verifies the admin password on the server and, on success, sets an
   HttpOnly session cookie. No password or secret ever reaches the client.
   ========================================================================== */
import { json, badRequest, readJson } from '../_lib.js';
import {
  adminConfigured, verifyPassword, createSession, sessionCookie,
  loginRateLimited, clearLoginRate, sameOrigin,
} from './_auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!sameOrigin(request)) return json({ ok: false, error: 'bad_origin' }, 403);
  if (!adminConfigured(env)) return json({ ok: false, error: 'admin_not_configured' }, 501);

  if (await loginRateLimited(env, request)) {
    return json({ ok: false, error: 'too_many_attempts' }, 429);
  }

  const body = await readJson(request);
  if (!body) return badRequest('invalid_json');

  const ok = await verifyPassword(env, String(body.password || ''));
  if (!ok) return json({ ok: false, error: 'invalid_credentials' }, 401);

  await clearLoginRate(env, request);
  const { id, ttlSeconds } = await createSession(env, request);

  return json({ ok: true }, 200, {
    'set-cookie': sessionCookie(request, id, ttlSeconds),
  });
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' });
}
