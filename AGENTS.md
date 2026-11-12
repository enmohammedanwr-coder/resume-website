# AGENTS.md — محمد أنور عمران / Personal Website

## What this is
Personal CV website for **Mohammed Anwar Yahya Ahmed Omran** (محمد أنور يحي أحمد عمران),
turned into a small **CV management platform**: a bilingual (AR/EN, RTL/LTR) static
frontend plus a serverless API (Cloudflare Pages Functions + KV) that powers a
password-protected dashboard with **live-editable content**, **private CV PDF
uploads**, and a **request → approval → consent → signed download** flow.

## Routes (one domain)
| Route | File | Purpose |
| ----- | ---- | ------- |
| `/`         | `index.html` | Landing page: his name, a **Home** button, and a **hidden** dashboard entry (discreet corner dot + `Ctrl/Cmd+Shift+A` + typing `admin`). Not advertised. |
| `/home`     | `home.html`  | The CV site itself. Pages maps the extensionless path to the file automatically — **do not** add a rewrite for it (that caused a redirect loop). |
| `/admin`    | `admin.html` | Dashboard: login gate + editor. Same auto-mapping. `noindex`. |

## Layout
- `index.html` — landing page (name, Home, discreet admin entry).
- `home.html` — the CV site, all sections (hero, about, projects, services, skills, qualifications, why, contact).
- `admin.html` — **dashboard** (password login → content editor, CV requests, PDF upload).
- `assets/css/style.css` — full design system (tokens, dark/light, RTL/LTR, responsive).
- `assets/css/landing.css` — landing page styling.
- `assets/css/admin.css` — dashboard styling (same palette, dark).
- `assets/js/data.js` — **bundled fallback content** (`SITE_DATA`, keys `ar` / `en` / `meta`).
- `assets/js/app.js` — i18n, theme, rendering, modal, form validation, particles; `loadLiveContent()` fetches `/api/content` (KV) and falls back to `data.js`.
- `assets/js/admin.js` — dashboard logic: session check, login/logout, edit AR/EN, image upload (canvas → JPEG dataURL), item CRUD, draft autosave (`localStorage.siteDraft`), **save to server** (`/api/admin/content`), requests list/approve/reject, CV PDF upload, optional GitHub publish.
- `assets/js/landing.js` — landing theme/lang toggle + discreet admin entry.
- `assets/img/` — project covers + `profile.jpg` placeholder.
- `make_images.py`, `make_cv.py` — regenerate images / CV.

## Backend (Cloudflare Pages Functions)
All under `functions/api/`. Shared helpers: `_lib.js` (KV, JSON, HMAC signing, optional email, Turnstile) and `_middleware.js` (CORS, security headers, `OPTIONS`).

**Auth** (`functions/api/admin/`):
- `_auth.js` — `sameOrigin()` CSRF check (compares against the `Host` header so it works behind proxies), password verify (`ADMIN_PASSWORD_HASH` pbkdf2, or plaintext `ADMIN_PASSWORD`), KV-backed sessions (`sess:<id>`, 12h TTL) in an HttpOnly `cv_admin` cookie, login rate limit.
- `login.js`, `logout.js`, `session.js`.

**Content**:
- `content.js` — public `GET` of live content (404 when KV empty → frontend uses `data.js`).
- `admin/content.js` — auth-gated save; extracts `data:` images to KV (`img:<hash>`) and rewrites them to `/api/img/<hash>`.
- `img/[[path]].js` — public immutable image serving by content-hash key.

**CV PDFs**:
- `_cv.js` — shared approval module (create request, approve/reject, sign/verify download token).
- `cv-request.js`, `cv-approve.js`, `cv-download.js` — public request, owner approval page (protected by `ADMIN_KEY`), signed+consent download.
- `admin/requests.js` — list / approve / reject requests.
- `admin/cv.js` — upload PDFs (`pdf:ar`, `pdf:en`) and report status.

## Editing content
Two ways:
1. **Dashboard** `/admin` → edit AR/EN → **✅ حفظ على الموقع** writes to KV (instant, live). **🚀 نشر** is an optional advanced path that pushes source files to GitHub via the Contents API (needs a classic PAT with `repo` scope).
2. Directly edit `assets/js/data.js` (bundled fallback). Never hardcode text in the HTML.

Draft → `localStorage.siteDraft`; preview at `home.html?preview=1`.

## Contact form
No fake success. Real sending requires `meta.formEndpoint` (Formspree/Web3Forms).
Until then the form honestly tells the visitor to use email/WhatsApp. Honeypot field `website`.

## Regenerate assets
```bash
pip install pillow reportlab arabic-reshaper python-bidi
python3 make_images.py   # project covers + profile placeholder
python3 make_cv.py       # CV PDF (uses Noto Sans Arabic — full glyph coverage)
```
Note: Tajawal lacks some isolated Arabic presentation forms → use Noto Sans Arabic for PDFs.

## Local preview
```bash
node tools/dev-server.mjs 12000   # full Pages emulation: static + Functions + KV
```
`tools/dev-server.mjs` serves `public/` (run `python3 tools/build-site.py` first) and
routes `/api/*` to the real `functions/api/` code, with a mock KV that persists text
and base64 binaries to `tools/cv/.dev-kv.json` (gitignored).
Dev defaults: `ADMIN_KEY=dev-admin-key`, `ADMIN_PASSWORD=dev-admin-password`.

Alternatively `./serve.sh 12000` (static-only, no API) — but the dashboard needs the API.

**Gotcha:** a foreground server dies when the shell session ends, which makes the
public preview URL return **502 Bad Gateway**. Start it detached (`setsid nohup ... &`).
The preview URL is ephemeral (tied to the sandbox) — real hosting is Cloudflare Pages.

## Build & deploy
`python3 tools/build-site.py` assembles `public/` (Pages build output dir). Cloudflare
Pages settings: build command `python3 tools/build-site.py`, output dir `public`,
functions dir `functions` (repo root). See `DEPLOY.md` for the full setup.

Required Cloudflare config: KV binding `CV_KV`; env vars `ADMIN_PASSWORD_HASH`
(preferred) or `ADMIN_PASSWORD`, `ADMIN_KEY`, `TOKEN_SECRET`; optional `SITE_URL`,
`MAIL_API_KEY`, `MAIL_FROM`, `NOTIFY_EMAIL`, `TURNSTILE_SECRET`.

> **PBKDF2 limit:** Cloudflare Workers WebCrypto rejects PBKDF2 iteration counts
> **above 100000** (`Pbkdf2 failed: iteration counts above 100000 are not supported`).
> `tools/admin/make-admin-hash.py` uses 100000; a hash generated with more will make
> every login fail with a 500 (`server_error`). `verifyPassword` now fails closed
> instead of throwing.

> **Extensionless routes:** Pages already serves `/home` from `home.html`. A `_redirects`
> 200-rewrite for it produces a 308 loop. `_redirects` only keeps the `/assets/cv/*` guard.

> **Live grades:** academic grades are edited in the dashboard («درجاتي» panel) and stored
> under `meta.grades`; the site reads `window.GRADES_DATA` from there and falls back to the
> bundled `assets/js/grades.js` when KV content is absent.

## Security model
- **CSP** is set in `tools/build-site.py` (`HEADERS`) and emitted into `public/_headers`:
  `script-src 'self'` (no `unsafe-inline`), `style-src` allows `'unsafe-inline'` +
  Google Fonts (404.html has an inline `<style>`, admin uses `style=` attributes),
  `connect-src` allow-lists the GitHub API, Formspree/Web3Forms and Cloudflare Turnstile.
  Because inline scripts are blocked, **never** add `on*=` attributes or inline `<script>`
  (JSON-LD `type="application/ld+json"` is data and is fine). Broken-image hiding uses a
  delegated `error` listener keyed on `data-hide-on-error`, not `onerror`.
- **XSS:** `assets/js/app.js` renders content via `innerHTML`, so every interpolated value
  goes through `esc()` and every `href`/`src` through `safeUrl()` (drops non-http/mailto/tel
  schemes). `admin.js`, `grades-ui.js`, `cv-request.js` already escape. Keep this invariant
  when adding new rendered fields.
- **API responses** (`functions/api/_lib.js` `SECURITY_HEADERS`) carry `default-src 'none'`
  CSP + COOP/CORP + `nosniff` + `frame-ancestors 'none'`.

> Note: no `Content-Security-Policy` existed before this hardening; `_headers` is generated,
> so edit `HEADERS` in `tools/build-site.py`, not `public/_headers`.

> Important: the CV PDFs are built into `tools/cv/dist/` (outside the deploy output and
> gitignored) and uploaded to KV only — **never** commit them or publish them as assets.

## النشر (Deployment)

- المستودع: https://github.com/enmohammedanwr-coder/resume-website (عام، فرع `main`)
- GitHub Pages كان الهدف الأصلي، لكن الموقع الآن يعتمد على Cloudflare Pages (Functions + KV).
- ملف `.nojekyll` موجود لتعطيل معالجة Jekyll.

## طلب تنزيل السيرة الذاتية (CV request flow)

لا يوجد ملف PDF منشور للتنزيل المباشر. المسار:

1. **طلب** — النموذج في الصفحة → `POST /api/cv-request` (اسم + بريد + سبب اختياري).
2. **موافقة المالك** — من لوحة التحكم (تبويب «طلبات السيرة») أو `GET /api/cv-approve?req=<id>&k=<ADMIN_KEY>`.
3. **تنزيل** — `GET /api/cv-download?token=<signed>&consent=1`؛ يتحقق من التوقيع والصلاحية، يسجّل الموافقة، ثم يبثّ الـ PDF من KV (`pdf:ar` / `pdf:en`).

الأمان: رابط التنزيل موقّع (HMAC-SHA256) ومؤقّت (`TOKEN_TTL_HOURS`)، ويتطلب `consent=1`.

