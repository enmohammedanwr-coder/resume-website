/* ==========================================================================
   GET /api/cv-approve?req=<id>&k=<ADMIN_KEY>[&action=reject]
   The owner clicks this from the notification email. On approval we mint a
   short-lived signed token and email it to the requester.
   ========================================================================== */
import {
  json, badRequest, kv, kvGetJson, kvPutJson, signToken, sendMail,
} from './_lib.js';

function siteUrl(env, request) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  return new URL(request.url).origin;
}

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

  const store = kv(env);
  const record = await kvGetJson(store, `req:${id}`);
  if (!record) return json({ ok: false, error: 'request_not_found' }, 404);

  if (action === 'reject') {
    record.status = 'rejected';
    record.decidedAt = new Date().toISOString();
    await kvPutJson(store, `req:${id}`, record);
    await kvPutJson(store, `email:${record.emailHash}`, {
      id, email: record.email, name: record.name, status: 'rejected',
    });
    return htmlPage('تم رفض الطلب', 'تم رفض طلب تنزيل السيرة الذاتية.');
  }

  // Approve: mint a signed, expiring token.
  const ttlHours = parseInt(env.TOKEN_TTL_HOURS || '48', 10);
  const exp = Date.now() + ttlHours * 60 * 60 * 1000;
  const secret = env.TOKEN_SECRET || env.ADMIN_KEY;
  const token = await signToken({ e: record.emailHash, r: id, exp }, secret);

  record.status = 'approved';
  record.decidedAt = new Date().toISOString();
  record.tokenExp = exp;
  await kvPutJson(store, `req:${id}`, record);
  await kvPutJson(store, `approved:${record.emailHash}`, { token, exp, email: record.email });
  await kvPutJson(store, `token:${token}`, { email: record.email, exp, id });

  const base = siteUrl(env, request);
  const link = `${base}/?cv=${encodeURIComponent(token)}`;

  await sendMail(env, {
    to: record.email,
    subject: record.lang === 'en'
      ? 'Your CV download link is approved'
      : 'تمت الموافقة على رابط تنزيل السيرة الذاتية',
    html: `<p>${record.lang === 'en' ? 'Hello' : 'مرحباً'} ${record.name},</p>
      <p>${record.lang === 'en'
        ? 'Your request was approved. Use the link below to download the CV (valid for a limited time):'
        : 'تمت الموافقة على طلبك. استخدم الرابط التالي لتنزيل السيرة الذاتية (صالح لمدة محدودة):'}</p>
      <p><a href="${link}">${link}</a></p>
      <p>${record.lang === 'en' ? 'Valid for' : 'صالح لمدة'} ${ttlHours} ${record.lang === 'en' ? 'hours' : 'ساعة'}.</p>`,
  });

  return htmlPage('تمت الموافقة ✅',
    `تمت الموافقة وإرسال رابط التنزيل إلى: <b>${record.email}</b>`);
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET' });
}
