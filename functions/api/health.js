/* Temporary diagnostic endpoint — remove after debugging. */
import { json } from './_lib.js';

export async function onRequest(context) {
  const { env } = context;
  const out = {
    hasKV: Boolean(env.CV_KV),
    hasAdminKey: Boolean(env.ADMIN_KEY),
    hasAdminPasswordHash: Boolean(env.ADMIN_PASSWORD_HASH),
    hasAdminPassword: Boolean(env.ADMIN_PASSWORD),
    hasTokenSecret: Boolean(env.TOKEN_SECRET),
    siteUrl: env.SITE_URL || null,
    kvType: typeof env.CV_KV,
  };
  try {
    if (env.CV_KV) {
      await env.CV_KV.put('health:ping', 'ok', { expirationTtl: 60 });
      out.kvGet = await env.CV_KV.get('health:ping');
    }
  } catch (e) {
    out.kvError = String(e && e.message ? e.message : e);
  }
  try {
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new Uint8Array(16), iterations: 210000, hash: 'SHA-256' },
      await crypto.subtle.importKey('raw', new TextEncoder().encode('x'), 'PBKDF2', false, ['deriveBits']),
      256
    );
    out.pbkdf2Ok = bits.byteLength === 32;
  } catch (e) {
    out.pbkdf2Error = String(e && e.message ? e.message : e);
  }
  return json(out);
}
