/* ==========================================================================
   Middleware for /api/* — CORS, security headers and method guards.
   ========================================================================== */
import { json, SECURITY_HEADERS } from './_lib.js';

const ALLOWED_METHODS = 'GET, POST, OPTIONS';

export async function onRequest(context) {
  const { request, next } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...SECURITY_HEADERS,
        allow: ALLOWED_METHODS,
        'access-control-allow-methods': ALLOWED_METHODS,
        'access-control-allow-headers': 'content-type, accept',
        'access-control-max-age': '86400',
      },
    });
  }

  let response;
  try {
    response = await next();
  } catch (err) {
    response = json({ ok: false, error: 'server_error' }, 500);
  }

  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  if (!headers.has('cache-control')) headers.set('cache-control', 'no-store');

  return new Response(response.body, { status: response.status, headers });
}
