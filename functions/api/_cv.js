/* ==========================================================================
   Shared CV request lifecycle — used by both the emailed approval link
   (cv-approve.js) and the dashboard (admin/requests.js) so the two paths can
   never drift apart.
   ========================================================================== */
import { kvGetJson, kvPutJson, signToken, sendMail } from './_lib.js';

export function siteUrl(env, request) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  return new URL(request.url).origin;
}

export async function approveRequest(env, request, id) {
  const store = env.CV_KV;
  const record = await kvGetJson(store, `req:${id}`);
  if (!record) return { ok: false, error: 'request_not_found' };

  const ttlHours = parseInt(env.TOKEN_TTL_HOURS || '48', 10);
  const exp = Date.now() + ttlHours * 60 * 60 * 1000;
  const secret = env.TOKEN_SECRET || env.ADMIN_KEY || 'dev-secret';
  const token = await signToken({ e: record.emailHash, r: id, exp }, secret);

  record.status = 'approved';
  record.decidedAt = new Date().toISOString();
  record.tokenExp = exp;
  await kvPutJson(store, `req:${id}`, record);
  await kvPutJson(store, `approved:${record.emailHash}`, { token, exp, email: record.email });
  await kvPutJson(store, `token:${token}`, { email: record.email, exp, id });

  const base = siteUrl(env, request);
  const link = `${base}/?cv=${encodeURIComponent(token)}`;
  const en = record.lang === 'en';
  await sendMail(env, {
    to: record.email,
    subject: en ? 'Your CV download link is approved' : 'تمت الموافقة على رابط تنزيل السيرة الذاتية',
    html: `<p>${en ? 'Hello' : 'مرحباً'} ${record.name},</p>
      <p>${en
        ? 'Your request was approved. Use the link below to download the CV (valid for a limited time):'
        : 'تمت الموافقة على طلبك. استخدم الرابط التالي لتنزيل السيرة الذاتية (صالح لمدة محدودة):'}</p>
      <p><a href="${link}">${link}</a></p>
      <p>${en ? 'Valid for' : 'صالح لمدة'} ${ttlHours} ${en ? 'hours' : 'ساعة'}.</p>`,
  });

  return { ok: true, token, record };
}

export async function rejectRequest(env, id) {
  const store = env.CV_KV;
  const record = await kvGetJson(store, `req:${id}`);
  if (!record) return { ok: false, error: 'request_not_found' };

  record.status = 'rejected';
  record.decidedAt = new Date().toISOString();
  await kvPutJson(store, `req:${id}`, record);
  await kvPutJson(store, `email:${record.emailHash}`, {
    id, email: record.email, name: record.name, status: 'rejected',
  });
  return { ok: true, record };
}
