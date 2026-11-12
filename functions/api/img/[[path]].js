/* ==========================================================================
   GET /api/img/<hash> — serve an image stored in KV (uploaded via the admin
   dashboard). Public and immutable: the key is a content hash, so the bytes
   never change for a given URL.
   ========================================================================== */
import { kv, json } from '../_lib.js';

const CONTENT_TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
};

export async function onRequestGet(context) {
  const { params, env } = context;
  const name = params.path ? (Array.isArray(params.path) ? params.path.join('/') : params.path) : '';
  const key = String(name).replace(/[^a-zA-Z0-9._-]/g, '');
  if (!key) return json({ ok: false, error: 'not_found' }, 404);

  const store = kv(env);
  if (!store) return json({ ok: false, error: 'no_storage' }, 404);

  const buf = await store.get(`img:${key}`, { type: 'arrayBuffer' });
  if (!buf) return json({ ok: false, error: 'not_found' }, 404);

  const ext = key.includes('.') ? key.split('.').pop().toLowerCase() : 'jpg';
  return new Response(buf, {
    status: 200,
    headers: {
      'content-type': CONTENT_TYPES[ext] || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
