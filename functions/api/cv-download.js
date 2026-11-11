/* ==========================================================================
   GET /api/cv-download?token=<signed>&consent=1[&lang=ar|en]
   Validates the approval token, records the visitor's consent, then streams
   the CV PDF.

   The PDF is stored PRIVATELY in KV (key "pdf:ar" / "pdf:en") — it is never a
   public static asset and is never committed to the repo, so it can only be
   fetched through an approved, signed token.
   ========================================================================== */
import { json, kv, kvPutJson, verifyToken, sha256Hex } from './_lib.js';

const FILENAMES = {
  ar: 'Mohammed-Anwar-CV.pdf',
  en: 'Mohammed-Anwar-CV-EN.pdf',
};

function deny(message, status = 403) {
  return new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1"><title>غير متاح</title>
     <style>body{font-family:system-ui,Segoe UI,sans-serif;background:#0b1224;color:#e8f0ff;
       display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
       .card{background:#121a33;border:1px solid #253357;border-radius:16px;padding:32px;max-width:520px;text-align:center}
       h1{margin:0 0 12px;font-size:1.3rem}p{color:#a9bbe0;line-height:1.7;margin:0}</style></head>
     <body><div class="card"><h1>غير متاح</h1><p>${message}</p></div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
  );
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const consent = url.searchParams.get('consent') === '1';
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'ar';

  const secret = env.TOKEN_SECRET || env.ADMIN_KEY;
  if (!secret) return deny('خدمة التنزيل غير مُهيّأة على الخادم.', 501);

  const payload = await verifyToken(token, secret);
  if (!payload) return deny('رابط التنزيل غير صالح أو منتهي الصلاحية. يُرجى طلب رابط جديد.', 403);

  if (!consent) return deny('يجب الموافقة على شروط الاستخدام قبل التنزيل.', 400);

  const store = kv(env);
  if (!store) return deny('خدمة التنزيل غير مُهيّأة على الخادم.', 501);

  // Record consent (audit trail) — best effort.
  const ip = request.headers.get('cf-connecting-ip') || '';
  await kvPutJson(store, `consent:${payload.r}:${Date.now()}`, {
    emailHash: payload.e,
    requestId: payload.r,
    at: new Date().toISOString(),
    ipHash: ip ? await sha256Hex(ip) : '',
    userAgent: (request.headers.get('user-agent') || '').slice(0, 200),
  });

  // Fetch the private PDF from KV. Cloudflare KV returns an ArrayBuffer for
  // { type: 'arrayBuffer' } — no base64 round-trip needed.
  const bytes = await store.get(`pdf:${lang}`, { type: 'arrayBuffer' });
  if (!bytes) return deny('ملف السيرة الذاتية غير متوفر حالياً.', 404);

  return new Response(bytes, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${FILENAMES[lang] || FILENAMES.ar}"`,
      'content-length': String(bytes.byteLength),
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
