#!/usr/bin/env python3
"""Build the professional CV PDF from tools/cv/cv-data.json + tools/cv/cv.css.

Renders the HTML with headless Chromium so Arabic shaping, RTL and the web
fonts are handled exactly like a real browser (no broken/disconnected letters).

Usage:
    python3 tools/cv/build-cv.py            # build Arabic + English PDFs
    python3 tools/cv/build-cv.py --lang ar  # build one language only

Outputs:
    assets/cv/Mohammed-Anwar-CV.pdf         (Arabic — served through the site)
    assets/cv/Mohammed-Anwar-CV-EN.pdf      (English)
"""
import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CV_DIR = os.path.join(BASE, "tools", "cv")
FONT_REGULAR = os.path.join(BASE, "assets", "fonts", "NotoSansArabic-Regular-subset.ttf")
FONT_BOLD = os.path.join(BASE, "assets", "fonts", "NotoSansArabic-Bold-subset.ttf")
OUT_DIR = os.path.join(BASE, "tools", "cv", "dist")  # not published; uploaded to KV

OUTPUTS = {
    "ar": "Mohammed-Anwar-CV.pdf",
    "en": "Mohammed-Anwar-CV-EN.pdf",
}

# Inline SVG icons (16x16 viewBox), filled with currentColor.
ICONS = {
    "user": '<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-3 0-5.5 1.6-5.5 3.6V15h11v-1.9c0-2-2.5-3.6-5.5-3.6Z"/>',
    "cap": '<path d="M8 2 0 6l8 4 6-3v4.5a1 1 0 1 0 2 0V6L8 2ZM4 9.2V12c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5V9.2l-4 2-4-2Z"/>',
    "skills": '<path d="M6.5 2 2 6.5l2 2L8.5 4.5 6.5 2Zm5 0 4.5 4.5-6.5 6.5-2-2L13.5 4.5 11.5 2ZM2 11l3 3-1.5 1.5L0 12.5 2 11Z"/>',
    "projects": '<path d="M6 2h4a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2Zm0 3h4V4H6v1Z"/>',
    "briefcase": '<path d="M5 4V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2Zm2-1v1h2V3H7Z"/>',
    "globe": '<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm5.5 5h-2a11 11 0 0 0-1-2.6A6 6 0 0 1 13.5 5ZM8 2c.5.7 1 1.7 1.4 3H6.6C7 3.7 7.5 2.7 8 2ZM2.3 9a6 6 0 0 1 0-2h2.3a13 13 0 0 0 0 2H2.3Zm.9 2h2a11 11 0 0 0 1 2.6A6 6 0 0 1 3.2 11Zm2-6h-2a6 6 0 0 1 3-2.6A11 11 0 0 0 5.2 5ZM8 14c-.5-.7-1-1.7-1.4-3h2.8C9 12.3 8.5 13.3 8 14Zm1.7-5H6.3a13 13 0 0 1 0-2h3.4a13 13 0 0 1 0 2Zm.9 4.6c.4-.8.7-1.7 1-2.6h2a6 6 0 0 1-3 2.6Z"/>',
    "cert": '<path d="M8 0 5.5 1.2 2.8 1 1.6 3.4 0 5.4l1.2 2.4L1.6 11 4 12.2 5.5 14.5 8 13.4l2.5 1.1L12 12.2l2.4-1.2-.4-3.2L15.2 5.4 13.6 3.4 12.4 1 9.7 1.2 8 0Zm-1 9.5-2-2 1-1 1 1 3-3 1 1-4 4Z"/>',
    "phone": '<path d="M4.6 1h1.7c.4 0 .7.2.8.6l.7 2.5c.1.3 0 .6-.3.8l-1 .8A9 9 0 0 0 9.3 9.2l.8-1c.2-.3.5-.4.8-.3l2.5.7c.4.1.6.4.6.8v1.7c0 .8-.6 1.5-1.5 1.5A12 12 0 0 1 3.1 2.5C3.1 1.6 3.8 1 4.6 1Z"/>',
    "mail": '<path d="M1.5 3h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm.3 1.2V11h12.4V4.2L8 7.5 1.8 4.2Zm12.1-.2H2.1L8 6.6l5.9-2.6Z"/>',
    "pin": '<path d="M8 0a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5Zm0 6.8A1.8 1.8 0 1 1 8 3.2a1.8 1.8 0 0 1 0 3.6Z"/>',
    "github": '<path d="M8 0a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 0-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.1 1.9 0 2.1.5.5.8 1.2.8 2.1 0 3.1-1.8 3.8-3.6 4 .3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A8 8 0 0 0 8 0Z"/>',
}

# Simple fallback so the CV still renders if an icon key is missing.
ICON_FALLBACK = '<circle cx="8" cy="8" r="6"/>'


def icon(name, size="3.4mm"):
    body = ICONS.get(name, ICON_FALLBACK)
    return f'<svg viewBox="0 0 16 16" fill="currentColor" style="width:{size};height:{size}">{body}</svg>'


def esc(text):
    return (str(text)
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def data_uri(path, mime):
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode("ascii")


def photo_block(photo_path, placeholder):
    if photo_path and os.path.isfile(photo_path):
        uri = data_uri(photo_path, "image/jpeg")
        return f'<img class="photo" src="{uri}" alt="photo" />'
    return f'<div class="photo photo--empty">{esc(placeholder)}</div>'


def render_header(d, photo_html):
    c = d["contact"]
    chips = []
    chips.append(f'<span class="chip">{icon("phone")}<b>{esc(c["phone"])}</b></span>')
    for e in c["emails"]:
        chips.append(f'<span class="chip">{icon("mail")}{esc(e)}</span>')
    if c.get("location"):
        chips.append(f'<span class="chip">{icon("pin")}{esc(c["location"])}</span>')
    if c.get("github"):
        chips.append(f'<span class="chip">{icon("github")}{esc(c["github"])}</span>')
    return f"""
    <header class="header">
      <div class="header__glow"></div>
      <div class="header__row">
        {photo_html}
        <div class="header__id">
          <h1 class="name">{esc(d["name"])}</h1>
          <p class="title">{esc(d["title"])}</p>
          <div class="chips">{''.join(chips)}</div>
        </div>
      </div>
    </header>"""


def section_head(icon_name, title):
    return f"""
      <div class="section__head">
        <span class="section__icon">{icon(icon_name, "3.9mm")}</span>
        <h2 class="section__title">{esc(title)}</h2>
      </div>"""


def render_education(d):
    if not d["education"]:
        return ""
    items = []
    for e in d["education"]:
        org = f'<p class="edu__org">{esc(e["org"])}</p>' if e.get("org") else ""
        meta = f'<span class="edu__meta">{esc(e["meta"])}</span>' if e.get("meta") else ""
        items.append(f'<div class="edu__item"><p class="edu__title">{esc(e["title"])}</p>{org}{meta}</div>')
    return f"""
    <section class="section">
      {section_head("cap", d["sections"]["education"])}
      <div class="edu">{''.join(items)}</div>
    </section>"""


def render_skills(d):
    if not d["skills"]:
        return ""
    blocks = []
    for g in d["skills"]:
        pills = "".join(f'<span class="pill">{esc(i)}</span>' for i in g["items"])
        blocks.append(f'<div><p class="skill__group">{esc(g["group"])}</p><div class="skill__items">{pills}</div></div>')
    return f"""
    <section class="section">
      {section_head("skills", d["sections"]["skills"])}
      <div class="skills">{''.join(blocks)}</div>
    </section>"""


def render_projects(d):
    if not d["projects"]:
        return ""
    items = []
    for p in d["projects"]:
        tech = f'<span class="tech">{esc(p["tech"])}</span>' if p.get("tech") else ""
        items.append(f"""
        <div class="proj">
          <div class="proj__top"><p class="proj__name">{esc(p["name"])}</p>{tech}</div>
          <p class="proj__desc">{esc(p["desc"])}</p>
        </div>""")
    return f"""
    <section class="section">
      {section_head("projects", d["sections"]["projects"])}
      <div class="projects">{''.join(items)}</div>
    </section>"""


def render_experience(d):
    if d.get("experience"):
        items = "".join(f"""
        <div class="exp__item">
          <p class="exp__role">{esc(x["role"])}</p>
          <p class="exp__org">{esc(x.get("org", ""))}</p>
          <p class="exp__desc">{esc(x.get("desc", ""))}</p>
        </div>""" for x in d["experience"])
        inner = f'<div class="exp">{items}</div>'
    else:
        inner = f'<p class="note">{esc(d.get("experienceEmpty", ""))}</p>'
    return f"""
    <section class="section">
      {section_head("briefcase", d["sections"]["experience"])}
      {inner}
    </section>"""


def render_languages(d):
    if not d["languages"]:
        return ""
    rows = []
    for lang in d["languages"]:
        rows.append(f"""
        <div class="lang__row">
          <span class="lang__name">{esc(lang["name"])}</span>
          <span class="lang__bar"><span class="lang__fill" style="width:{int(lang.get("value", 0))}%"></span></span>
          <span class="lang__level">{esc(lang["level"])}</span>
        </div>""")
    return f"""
    <section class="section">
      {section_head("globe", d["sections"]["languages"])}
      <div class="langs">{''.join(rows)}</div>
    </section>"""


def render_certificates(d):
    if not d.get("certificates"):
        return ""
    items = "".join(f"<li>{esc(c)}</li>" for c in d["certificates"])
    return f"""
    <section class="section">
      {section_head("cert", d["certificatesTitle"])}
      <ul class="certs">{items}</ul>
    </section>"""


def render_html(lang, data, css, photo_html):
    d = data[lang]
    body = (
        render_education(d)
        + render_skills(d)
        + render_projects(d)
        + render_experience(d)
        + render_certificates(d)
        + render_languages(d)
    )
    return f"""<!DOCTYPE html>
<html lang="{d['lang']}" dir="{d['dir']}">
<head>
<meta charset="utf-8" />
<title>{esc(d['name'])} — CV</title>
<style>{css}</style>
</head>
<body>
  <div class="page">
    {render_header(d, photo_html)}
    <div class="body">
      <section class="section">
        {section_head("user", d["sections"]["profile"])}
        <p class="profile">{esc(d["profile"])}</p>
      </section>
      {body}
    </div>
    <div class="footer">{esc(d.get('footer', ''))}</div>
  </div>
</body>
</html>"""


def find_chromium():
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        p = shutil.which(name)
        if p:
            return p
    raise RuntimeError("Chromium/Chrome not found — install it to build the CV PDF.")


def build(lang, data, css, photo_html, chromium):
    html = render_html(lang, data, css, photo_html)
    out_name = OUTPUTS[lang]
    out_path = os.path.join(OUT_DIR, out_name)
    os.makedirs(OUT_DIR, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        html_path = os.path.join(tmp, "cv.html")
        with open(html_path, "w", encoding="utf-8") as fh:
            fh.write(html)
        cmd = [
            chromium, "--headless", "--no-sandbox", "--disable-gpu",
            "--no-pdf-header-footer", "--print-to-pdf-no-header",
            f"--print-to-pdf={out_path}", "file://" + html_path,
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0 or not os.path.isfile(out_path):
            sys.stderr.write(proc.stderr)
            raise RuntimeError(f"Chromium failed to build {out_name}")

    size = os.path.getsize(out_path)
    print(f"  ✓ {out_name}  ({size:,} bytes)")
    return out_path


def main():
    ap = argparse.ArgumentParser(description="Build the CV PDF.")
    ap.add_argument("--lang", choices=["ar", "en", "both"], default="both")
    args = ap.parse_args()

    with open(os.path.join(CV_DIR, "cv-data.json"), encoding="utf-8") as fh:
        data = json.load(fh)
    with open(os.path.join(CV_DIR, "cv.css"), encoding="utf-8") as fh:
        css = fh.read()

    font_regular = data_uri(FONT_REGULAR, "font/ttf")
    font_bold = data_uri(FONT_BOLD, "font/ttf")
    css = css.replace("__FONT_REGULAR__", font_regular).replace("__FONT_BOLD__", font_bold)

    photo_path = os.path.join(BASE, data.get("photo", "")) if data.get("photo") else None

    langs = ["ar", "en"] if args.lang == "both" else [args.lang]
    chromium = find_chromium()

    print("Building CV PDF(s):")
    for lang in langs:
        photo_html = photo_block(photo_path, data[lang].get("photoPlaceholder", "Photo"))
        build(lang, data, css, photo_html, chromium)
    print("Done.")


if __name__ == "__main__":
    main()
