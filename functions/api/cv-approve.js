/* ==========================================================================
   GET /api/cv-approve?req=<id>&k=<ADMIN_KEY>[&action=reject]
   The owner clicks this from the notification email. On approval a
   short-lived signed token is minted and emailed to the requester.
   (The dashboard uses the same logic via /api/admin/requests.)
   ========================================================================== */
import { json, badRequest } from './_lib.js';
import { approveRequest, rejectRequest } from './_cv.js';

function htmlPage(title, message) {
  return new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title}</title>
     <style>body{font-family:system-ui,Segoe UI,sans-serif;background:#0b1224;color:#e8f0ff;
       display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
       .card{background:#121a33;border:1px solid #253357;border-radius:16px;padding:32px;
       max-width:520px;text-align:center}h1{margin:0 0 12px;font-size:1.4rem}
       p{color:#a9bbe0;line-height:1.7;margin:0}</style></head>
     <body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`,
    { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
  );
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('req') || '';
  const key = url.searchParams.get('k') || '';
  const action = url.searchParams.get('action') || 'approve';

  if (!env.ADMIN_KEY) {
    return json({ ok: false, error: 'admin_not_configured' }, 501);
  }
  if (key !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }
  if (!id) return badRequest('missing_request_id');

  if (action === 'reject') {
    const res = await rejectRequest(env, id);
    if (!res.ok) return json({ ok: false, error: res.error }, 404);
    return htmlPage('تم رفض الطلب', 'تم رفض طلب تنزيل السيرة الذاتية.');
  }

  const res = await approveRequest(env, request, id);
  if (!res.ok) return json({ ok: false, error: res.error }, 404);
  return htmlPage('تمت الموافقة ✅',
    `تمت الموافقة وإرسال رابط التنزيل إلى: <b>${res.record.email}</b>`);
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
