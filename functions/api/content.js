/* ==========================================================================
   GET /api/content — public site content.

   Content is edited from the admin dashboard and stored in KV under `content`.
   Image uploads are pulled out into separate KV entries (`img:<hash>`) and
   referenced as /api/img/<hash> so the JSON stays small.
   If KV has no content yet, the frontend falls back to the bundled data.js.
   ========================================================================== */
import { json, kv, kvGetJson } from './_lib.js';

export async function onRequestGet(context) {
  const { env } = context;
  const store = kv(env);
  const content = await kvGetJson(store, 'content');
  if (!content) {
    return json({ ok: false, error: 'no_content' }, 404, {
      'cache-control': 'public, max-age=30',
    });
  }
  return json({ ok: true, content, updatedAt: content.__updatedAt || null }, 200, {
    'cache-control': 'public, max-age=30',
  });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
