/* ==========================================================================
   POST /api/admin/logout — destroys the session and clears the cookie.
   ========================================================================== */
import { json } from '../_lib.js';
import { destroySession, clearCookie } from './_auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  await destroySession(env, request);
  return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' });
}
