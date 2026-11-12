/* ==========================================================================
   /api/admin/content

   GET  — return the current content (admin view).
   POST — save content edited in the dashboard.

   Body: { content, images?: [{ name, dataUrl }] }
   Uploaded images (data: URLs) are written to KV as `img:<hash>` and the
   stored content references them via /api/img/<hash>, keeping the JSON small.
   Requires a valid admin session and a same-origin request.
   ========================================================================== */
import { json, badRequest, readJson, kv, kvGetJson, kvPutJson, sha256Hex } from '../_lib.js';
import { requireSession, sameOrigin } from './_auth.js';

const MAX_IMAGE_BYTES = 1_500_000; // ~1.5 MB per image

async function handleGet(env) {
  const store = kv(env);
  const content = await kvGetJson(store, 'content');
  return json({ ok: true, content: content || null });
}

function dataUrlToBytes(dataUrl) {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl || '');
  if (!m || !m[2]) return null;
  const bin = atob(m[3]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return { mime: m[1] || 'image/jpeg', bytes: out };
}

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

async function handlePost(context) {
  const { request, env } = context;

  if (!sameOrigin(request)) return json({ ok: false, error: 'bad_origin' }, 403);
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);

  const store = kv(env);
  if (!store) return json({ ok: false, error: 'no_storage' }, 501);

  const body = await readJson(request);
  if (!body || typeof body.content !== 'object' || body.content === null) {
    return badRequest('invalid_content');
  }

  // Persist uploaded images and rewrite the data: URLs to /api/img/<hash>.
  const images = Array.isArray(body.images) ? body.images : [];
  const map = {};
  for (const img of images) {
    if (!img || typeof img.dataUrl !== 'string') continue;
    const decoded = dataUrlToBytes(img.dataUrl);
    if (!decoded) continue;
    if (decoded.bytes.length > MAX_IMAGE_BYTES) {
      return badRequest('image_too_large');
    }
    const hash = (await sha256Hex(img.dataUrl)).slice(0, 32);
    const ext = EXT[decoded.mime] || 'jpg';
    const key = `${hash}.${ext}`;
    await store.put(`img:${key}`, decoded.bytes.buffer, {
      metadata: { contentType: decoded.mime },
    });
    map[img.dataUrl] = `/api/img/${key}`;
  }

  // Replace any data: URL in the content with its hosted equivalent.
  const replace = (obj) => {
    if (Array.isArray(obj)) { obj.forEach(replace); return; }
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if (typeof v === 'string' && v.startsWith('data:image')) {
          obj[k] = map[v] || v;
        } else {
          replace(v);
        }
      });
    }
  };
  replace(body.content);

  const content = { ...body.content, __updatedAt: new Date().toISOString() };
  await kvPutJson(store, 'content', content);

  return json({ ok: true, updatedAt: content.__updatedAt });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'GET') {
    const session = await requireSession(env, request);
    if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
    return handleGet(env);
  }
  if (request.method === 'POST') return handlePost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET, POST' });
}
