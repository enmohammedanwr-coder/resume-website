/* ==========================================================================
   GET /api/admin/session — is the caller an authenticated admin?
   Returns { ok, configured, kvReady }. Used by admin.html to decide between
   the login screen and the dashboard.
   ========================================================================== */
import { json } from '../_lib.js';
import { requireSession, adminConfigured } from './_auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await requireSession(env, request);
  return json({
    ok: Boolean(session),
    configured: adminConfigured(env),
    kvReady: Boolean(env.CV_KV),
  });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
