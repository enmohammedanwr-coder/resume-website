# AGENTS.md — محمد أنور عمران / Personal Website

## What this is
Static personal portfolio + CV website for **Mohammed Anwar Yahya Ahmed Omran**
(محمد أنور يحي أحمد عمران). Pure HTML/CSS/JS — no build step, no framework.

## Layout
- `index.html` — single page, all sections (hero, about, projects, services, skills, qualifications, why, contact).
- `admin.html` — **admin panel** (editor → publish to GitHub). No password gate. `noindex`.
- `assets/css/style.css` — full design system (tokens, dark/light, RTL/LTR, responsive).
- `assets/css/admin.css` — admin panel styling (same palette).
- `assets/js/data.js` — **all content** in one place (`SITE_DATA`, keys `ar` / `en` / `meta`).
- `assets/js/app.js` — i18n, theme, rendering, modal, form validation, particles. Supports `?preview=1` (loads `siteDraft` from localStorage).
- `assets/js/admin.js` — admin logic: edit AR/EN, image upload (canvas → JPEG dataURL, max 1400px), item CRUD, draft autosave to `localStorage.siteDraft`, `generateDataJS()`, `extractImages()`, GitHub publish via Contents API.
- `assets/img/` — generated project covers + `profile.jpg` placeholder.
- `assets/cv/Mohammed-Anwar-CV.pdf` — generated CV.
- `make_images.py`, `make_cv.py` — regenerate images / CV.

## Editing content
Two ways:
1. **Admin panel** `admin.html` (opens directly, no password). Buttons: 👁 preview, ✅ **تعديل البيانات** (confirm → apply draft to homepage via `index.html?preview=1`), ↺ reset, 🚀 publish.
   Draft → `localStorage.siteDraft`; preview at `index.html?preview=1`; publish pushes `data.js` + images + site files via GitHub Contents API.
2. Directly edit `assets/js/data.js`. Never hardcode text in `index.html`.

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
./serve.sh 12000          # runs serve.py detached (setsid+nohup); survives shell exit
# or manually:
python3 serve.py 12000
```
`serve.py` (not `python -m http.server`) is used on purpose: it sends
`Cache-Control: no-store`, otherwise the browser caches `admin.js`/`app.js` and
edits look "not applied" until a hard refresh.

**Gotcha:** a foreground server dies when the shell session ends, which makes the
public preview URL (`work-1-*.prod-runtime.all-hands.dev`) return **502 Bad Gateway /
"no available server"**. Always start it detached (see `serve.sh`).
This preview URL is also ephemeral (tied to the sandbox) — real hosting is GitHub Pages.

## Publishing
Target: GitHub Pages repo `enmohammedanwr-coder/resume-website` → `https://enmohammedanwr-coder.github.io/resume-website/`
`.nojekyll` is present (needed for `assets/` paths). SEO files: `robots.txt` (disallows `/admin.html`), `sitemap.xml`, `404.html`.

Primary path for the user: **admin.html → 🚀 نشر** (needs a classic PAT with `repo` scope).

**Env caveat:** the provided `GITHUB_TOKEN` here is a GitHub *App installation* token
(`ghu_` prefix, `x-oauth-scopes` empty) — it can read user info but **cannot create
repositories** (`Resource not accessible by integration`, 403). To publish, the user must
create the repo themselves (web UI) or use a token with `repo` scope.

## النشر (Deployment)

- المستودع: https://github.com/enmohammedanwr-coder/resume-website (عام، فرع `main`)
- الموقع المنشور: https://enmohammedanwr-coder.github.io/resume-website/
- GitHub Pages: مُفعّل من فرع `main` / الجذر `/`، HTTPS مُفعّل.
- ملف `.nojekyll` موجود لتعطيل معالجة Jekyll.
