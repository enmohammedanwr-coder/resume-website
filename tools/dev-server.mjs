/* ==========================================================================
   Local dev server — emulates Cloudflare Pages (static + Functions + KV).

   Serves `public/` as the static site and routes `/api/*` to the real files
   under `functions/api/`, including `_middleware.js`. A tiny file-backed KV
   stands in for the Cloudflare KV namespace so the whole CV request → approve
   → consent → download flow can be exercised locally.

   Usage:
       node tools/dev-server.mjs [port]        # default 12000
   Then open http://localhost:<port>/

   Local config (env overrides):
       ADMIN_KEY       (default: dev-admin-key)
       TOKEN_SECRET    (default: dev-token-secret)
   The CV PDFs in tools/cv/dist/ are auto-loaded into KV as pdf:ar / pdf:en.
   ========================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUBLIC_DIR = path.join(ROOT, 'public');
const FUNC_DIR = path.join(ROOT, 'functions', 'api');
const DIST_DIR = path.join(ROOT, 'tools', 'cv', 'dist');
const KV_FILE = path.join(ROOT, 'tools', 'cv', '.dev-kv.json');

const PORT = parseInt(process.argv[2] || '12000', 10);

/* ---------------- tiny file-backed KV ---------------- */
const store = new Map();
if (fs.existsSync(KV_FILE)) {
  try {
    for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(KV_FILE, 'utf8')))) {
      if (v && typeof v === 'object' && v.b64) {
        store.set(k, { kind: 'bytes', value: new Uint8Array(Buffer.from(v.b64, 'base64')) });
      } else {
        store.set(k, { kind: 'text', value: v });
      }
    }
  } catch { /* ignore corrupt file */ }
}
function persistKV() {
  const out = {};
  for (const [k, v] of store) {
    out[k] = v.kind === 'text' ? v.value : { b64: Buffer.from(v.value).toString('base64') };
  }
  fs.writeFileSync(KV_FILE, JSON.stringify(out, null, 2));
}
const KV = {
  async get(key, opts) {
    const entry = store.get(key);
    if (!entry) return null;
    if (opts && opts.type === 'arrayBuffer') {
      if (entry.kind === 'bytes') return entry.value.buffer.slice(
        entry.value.byteOffset, entry.value.byteOffset + entry.value.byteLength);
      return null;
    }
    return entry.kind === 'text' ? entry.value : null;
  },
  async put(key, value, opts) {
    const meta = (opts && opts.metadata) || null;
    if (typeof value === 'string') store.set(key, { kind: 'text', value, meta });
    else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      store.set(key, { kind: 'bytes', value: value instanceof ArrayBuffer ? new Uint8Array(value) : value, meta });
    }
    persistKV();
  },
  async delete(key) { store.delete(key); persistKV(); },
  async list(opts = {}) {
    const prefix = opts.prefix || '';
    const keys = [...store.keys()].filter((k) => k.startsWith(prefix)).sort();
    return { keys: keys.map((name) => ({ name })), list_complete: true, cursor: null };
  },
  async getWithMetadata(key, opts) {
    const entry = store.get(key);
    if (!entry) return { value: null, metadata: null };
    if (opts && opts.type === 'arrayBuffer') {
      if (entry.kind !== 'bytes') return { value: null, metadata: entry.meta || null };
      const ab = entry.value.buffer.slice(entry.value.byteOffset, entry.value.byteOffset + entry.value.byteLength);
      return { value: ab, metadata: entry.meta || null };
    }
    return { value: entry.kind === 'text' ? entry.value : null, metadata: entry.meta || null };
  },
};

// Auto-load the private CV PDFs (as publish-kv.py would in production).
for (const [key, file] of [['pdf:ar', 'Mohammed-Anwar-CV.pdf'], ['pdf:en', 'Mohammed-Anwar-CV-EN.pdf']]) {
  const p = path.join(DIST_DIR, file);
  if (fs.existsSync(p)) store.set(key, { kind: 'bytes', value: new Uint8Array(fs.readFileSync(p)) });
}

const env = {
  CV_KV: KV,
  ADMIN_KEY: process.env.ADMIN_KEY || 'dev-admin-key',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'dev-admin-password',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'dev-token-secret',
  TOKEN_TTL_HOURS: '48',
  SITE_URL: `http://localhost:${PORT}`,
};

/* ---------------- routing ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.ttf': 'font/ttf', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.map': 'application/json',
};

async function loadFunction(rel) {
  const file = path.join(FUNC_DIR, rel);
  if (!fs.existsSync(file)) return null;
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
  return mod;
}

function selectHandler(mod, method) {
  const named = mod['onRequest' + method[0] + method.slice(1).toLowerCase()];
  return named || mod.onRequest || null;
}

// Resolve an /api/<path> to a function file. Supports Cloudflare catch-all
// routes such as functions/api/img/[[path]].js (matched as `params.path`).
function resolveRoute(rel) {
  const direct = path.join(FUNC_DIR, rel + '.js');
  if (fs.existsSync(direct)) return { rel: rel + '.js', params: {} };

  const segs = rel.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i--) {
    const prefix = segs.slice(0, i);
    const rest = segs.slice(i);
    const cand = path.join(FUNC_DIR, ...prefix, '[[path]].js');
    if (fs.existsSync(cand)) {
      return { rel: [...prefix, '[[path]].js'].join('/'), params: { path: rest.join('/') } };
    }
  }
  return null;
}

async function serveApi(request) {
  const url = new URL(request.url);
  const rel = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const route = resolveRoute(rel);
  if (!route) return new Response('Not found', { status: 404 });

  const mod = await loadFunction(route.rel);
  if (!mod) return new Response('Not found', { status: 404 });

  const handler = selectHandler(mod, request.method);
  if (!handler) return new Response('Method not allowed', { status: 405 });

  const mwMod = await loadFunction('_middleware.js');
  const ctx = { request, env, params: route.params, data: {} };
  const run = () => handler(ctx);
  if (mwMod && mwMod.onRequest) {
    ctx.next = run;
    return mwMod.onRequest(ctx);
  }
  return run();
}

// Mirrors _redirects: pretty URL -> real file, served with a 200 (rewrite).
const REWRITES = new Map([
  ['/home', '/home.html'],
  ['/admin', '/admin.html'],
]);

function serveStatic(request) {
  const url = new URL(request.url);
  let rel = decodeURIComponent(url.pathname);
  if (REWRITES.has(rel)) rel = REWRITES.get(rel);
  if (rel === '/' || rel.endsWith('/')) rel += 'index.html';
  const file = path.join(PUBLIC_DIR, rel);
  if (rel.startsWith('/assets/cv/')) {
    const nf = path.join(PUBLIC_DIR, '404.html');
    return new Response(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found', {
      status: 404, headers: { 'content-type': MIME['.html'], 'cache-control': 'no-store' },
    });
  }
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const notFound = path.join(PUBLIC_DIR, '404.html');
    if (fs.existsSync(notFound)) {
      return new Response(fs.readFileSync(notFound), {
        status: 404, headers: { 'content-type': MIME['.html'], 'cache-control': 'no-store' },
      });
    }
    return new Response('Not found', { status: 404 });
  }
  const ext = path.extname(file).toLowerCase();
  return new Response(fs.readFileSync(file), {
    status: 200,
    headers: { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' },
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined
    : Buffer.concat(await new Promise((resolve) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(chunks));
      }));
  const request = new Request(url.href, {
    method: req.method,
    headers: req.headers,
    body,
    duplex: 'half',
  });

  let response;
  try {
    response = url.pathname.startsWith('/api/') ? await serveApi(request) : serveStatic(request);
  } catch (err) {
    console.error(err);
    response = new Response(JSON.stringify({ ok: false, error: 'server_error' }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }

  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
  console.log(`${req.method} ${url.pathname} → ${response.status}`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dev server (Pages emulation) on http://localhost:${PORT}`);
  console.log(`  static:    public/`);
  console.log(`  functions: functions/api/  (ADMIN_KEY=${env.ADMIN_KEY})`);
  console.log(`  PDFs in KV: ${fs.existsSync(DIST_DIR) ? 'loaded' : 'MISSING — run tools/cv/build-cv.py'}`);
});
