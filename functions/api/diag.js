/* Temporary diagnostic endpoint — remove after debugging. */
import { json } from './_lib.js';
import { verifyPassword, adminConfigured } from './admin/_auth.js';

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pw = url.searchParams.get('pw') || '';
  const out = {
    adminConfigured: adminConfigured(env),
    hashLen: (env.ADMIN_PASSWORD_HASH || '').length,
    hashPrefix: (env.ADMIN_PASSWORD_HASH || '').slice(0, 18),
    hashParts: (env.ADMIN_PASSWORD_HASH || '').split('$').length,
  };
  try {
    out.verifyResult = await verifyPassword(env, pw);
  } catch (e) {
    out.verifyError = String(e && e.message ? e.message : e);
    out.verifyStack = String(e && e.stack ? e.stack : '').slice(0, 300);
  }
  return json(out);
}
