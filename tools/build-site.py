#!/usr/bin/env python3
"""Assemble the Cloudflare Pages output directory (`public/`).

Copies only the public frontend files from the repo root, adds the Pages
config files (_headers, _routes.json) and deliberately excludes the CV PDFs
(served through /api/cv-download) and all internal/admin tooling.

Cloudflare Pages project settings:
    Build command:        python3 tools/build-site.py
    Build output dir:     public
    Functions directory:  functions   (repo root)

Usage:
    python3 tools/build-site.py
"""
import os
import shutil

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "public")

# Files / folders copied verbatim into the output directory.
INCLUDE = [
    "index.html",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    "assets/css",
    "assets/js",
    "assets/img",
]

# Never publish these (kept out of the output even if listed above).
EXCLUDE_NAMES = {"admin.html", "admin.css", "admin.js"}

ROUTES_JSON = """{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
"""

HEADERS = """# Security headers for the static site
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

# Long-cache immutable assets
/assets/*
  Cache-Control: public, max-age=604800
"""


def copy_item(rel):
    src = os.path.join(BASE, rel)
    dst = os.path.join(OUT, rel)
    if not os.path.exists(src):
        print(f"  ! skip (missing): {rel}")
        return
    if os.path.isdir(src):
        shutil.copytree(src, dst, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns(*EXCLUDE_NAMES))
    else:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)


def main():
    print("Building public/ ...")
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT, exist_ok=True)

    for rel in INCLUDE:
        copy_item(rel)

    # Remove any admin files that slipped in via a copied folder.
    for root, _dirs, files in os.walk(OUT):
        for name in files:
            if name in EXCLUDE_NAMES:
                os.remove(os.path.join(root, name))

    with open(os.path.join(OUT, "_headers"), "w", encoding="utf-8") as fh:
        fh.write(HEADERS)
    with open(os.path.join(OUT, "_routes.json"), "w", encoding="utf-8") as fh:
        fh.write(ROUTES_JSON)

    total = 0
    count = 0
    for root, _dirs, files in os.walk(OUT):
        for name in files:
            total += os.path.getsize(os.path.join(root, name))
            count += 1
    print(f"  ✓ {count} files, {total/1024:.0f} KB")
    print("Done. Set the Pages build output directory to 'public'.")


if __name__ == "__main__":
    main()
