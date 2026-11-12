/* ==========================================================================
   /api/admin/requests — CV download request log for the dashboard.

   GET  ?status=pending|approved|rejected|all   → list requests (newest first)
   POST { id, action: "approve" | "reject" }    → decide a request

   Approving mints a signed token and emails the requester, exactly like the
   emailed approval link (shared logic in ../_cv.js).
   ========================================================================== */
import { json, badRequest, readJson, kv } from '../_lib.js';
import { requireSession, sameOrigin } from './_auth.js';
import { approveRequest, rejectRequest } from '../_cv.js';

const MAX_LIST = 200;

async function listRequests(env, status) {
  const store = kv(env);
  if (!store) return [];
  const out = [];
  let cursor;
  do {
    const page = await store.list({ prefix: 'req:', cursor, limit: 1000 });
    for (const k of page.keys) {
      const raw = await store.get(k.name);
      if (!raw) continue;
      let rec; try { rec = JSON.parse(raw); } catch { continue; }
      if (!status || status === 'all' || rec.status === status) out.push(rec);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return out.slice(0, MAX_LIST);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);

  const status = new URL(request.url).searchParams.get('status') || 'all';
  const requests = await listRequests(env, status);
  return json({ ok: true, requests });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return json({ ok: false, error: 'bad_origin' }, 403);
  const session = await requireSession(env, request);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);

  const body = await readJson(request);
  if (!body || !body.id) return badRequest('missing_id');
  const action = body.action === 'reject' ? 'reject' : 'approve';

  if (action === 'reject') {
    const res = await rejectRequest(env, String(body.id));
    if (!res.ok) return json({ ok: false, error: res.error }, 404);
    return json({ ok: true, status: 'rejected' });
  }

  const res = await approveRequest(env, request, String(body.id));
  if (!res.ok) return json({ ok: false, error: res.error }, 404);
  return json({ ok: true, status: 'approved', token: res.token });
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'GET, POST' });
}
