# AGENTS.md — محمد أنور عمران / Personal Website

## What this is
Static personal portfolio + CV website for **Mohammed Anwar Yahya Ahmed Omran**
(محمد أنور يحي أحمد عمران). Pure HTML/CSS/JS — no build step, no framework.

## Layout
- `index.html` — single page, all sections (hero, about, projects, services, skills, qualifications, why, contact).
- `assets/css/style.css` — full design system (tokens, dark/light, RTL/LTR, responsive).
- `assets/js/data.js` — **all content** in one place (`SITE_DATA`, keys `ar` / `en` / `meta`).
- `assets/js/app.js` — i18n, theme, rendering, modal, form validation, particles.
- `assets/img/` — generated project covers + `profile.jpg` placeholder.
- `assets/cv/Mohammed-Anwar-CV.pdf` — generated CV.
- `make_images.py`, `make_cv.py` — regenerate images / CV.

## Editing content
Edit `assets/js/data.js` only. Never hardcode text in `index.html`.

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
python3 -m http.server 12000
```

## Publishing
Target: GitHub Pages repo `enmohammedanwr-coder/resume-website` → `https://enmohammedanwr-coder.github.io/resume-website/`
`.nojekyll` is present (needed for `assets/` paths). SEO files: `robots.txt`, `sitemap.xml`, `404.html`.

**Env caveat:** the provided `GITHUB_TOKEN` here is a GitHub *App installation* token
(`ghu_` prefix, `x-oauth-scopes` empty) — it can read user info but **cannot create
repositories** (`Resource not accessible by integration`, 403). To publish, the user must
create the repo themselves (web UI) or use a token with `repo` scope.
