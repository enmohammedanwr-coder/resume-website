/* ==========================================================================
   /api/admin/cv — manage the private CV PDFs (stored in KV, never published).

   GET  → { ok, ar: {present, size}, en: {present, size} }
   POST → multipart/form-data with fields `lang` (ar|en) and `file` (PDF).
          Validates it really is a PDF and stores it as `pdf:ar` / `pdf:en`.
   ========================================================================== */
import { json, badRequest, kv } from '../_lib.js';
import { requireSession, sameOrigin } from './_auth.js';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

async function info(store, key) {
  if (!store) return { present: false };
  const head = await store.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!head || !head.value) return { present: false };
  const bytes = head.value.byteLength !== undefined ? head.value.byteLength : 0;
  return { present: true, size: bytes, uploadedAt: (head.metadata && head.metadata.uploadedAt) || null };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
  const store = kv(env);
  return json({ ok: true, ar: await info(store, 'pdf:ar'), en: await info(store, 'pdf:en') });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return json({ ok: false, error: 'bad_origin' }, 403);
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);

  const store = kv(env);
  if (!store) return json({ ok: false, error: 'no_storage' }, 501);

  let form;
  try { form = await request.formData(); } catch { return badRequest('invalid_form'); }

  const lang = form.get('lang') === 'en' ? 'en' : 'ar';
  const file = form.get('file');
  if (!file || typeof file === 'string') return badRequest('missing_file');
  if (file.size > MAX_BYTES) return badRequest('file_too_large', 413);

  const buf = await file.arrayBuffer();
  const magic = new TextDecoder().decode(new Uint8Array(buf.slice(0, 5)));
  if (magic !== '%PDF-') return badRequest('not_a_pdf');

  await store.put(`pdf:${lang}`, buf, {
    metadata: { contentType: 'application/pdf', uploadedAt: new Date().toISOString() },
  });

  return json({ ok: true, lang, size: buf.byteLength });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET, POST' });
}
