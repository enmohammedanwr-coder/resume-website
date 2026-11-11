#!/usr/bin/env python3
"""Upload the built CV PDFs to a private Cloudflare KV namespace.

The download Function reads the PDFs from KV (`pdf:ar`, `pdf:en`) so the files
are never published as static assets and never committed to the repo.

Prerequisites (Cloudflare dashboard):
  1. Create a KV namespace, e.g. "cv-files".
  2. Bind it to the Pages project as CV_KV (Settings → Functions → KV bindings).

Auth — either use the Cloudflare REST API (this script):
    export CF_ACCOUNT_ID=...
    export CF_KV_NAMESPACE_ID=...
    export CF_API_TOKEN=...            # token with "Workers KV Storage: Edit"
    python3 tools/cv/publish-kv.py

Or use wrangler instead:
    npx wrangler kv key put --remote --namespace-id <ID> pdf:ar \\
        --path tools/cv/dist/Mohammed-Anwar-CV.pdf
    npx wrangler kv key put --remote --namespace-id <ID> pdf:en \\
        --path tools/cv/dist/Mohammed-Anwar-CV-EN.pdf
"""
import os
import sys
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIST = os.path.join(BASE, "tools", "cv", "dist")

FILES = {
    "pdf:ar": "Mohammed-Anwar-CV.pdf",
    "pdf:en": "Mohammed-Anwar-CV-EN.pdf",
}


def main():
    account = os.environ.get("CF_ACCOUNT_ID")
    namespace = os.environ.get("CF_KV_NAMESPACE_ID")
    token = os.environ.get("CF_API_TOKEN")
    if not (account and namespace and token):
        sys.exit("Missing CF_ACCOUNT_ID / CF_KV_NAMESPACE_ID / CF_API_TOKEN.")

    for key, filename in FILES.items():
        path = os.path.join(DIST, filename)
        if not os.path.isfile(path):
            sys.exit(f"Missing {path} — run tools/cv/build-cv.py first.")
        with open(path, "rb") as fh:
            body = fh.read()
        url = (f"https://api.cloudflare.com/client/v4/accounts/{account}"
               f"/storage/kv/namespaces/{namespace}/values/{key}")
        req = urllib.request.Request(url, data=body, method="PUT", headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/pdf",
        })
        with urllib.request.urlopen(req) as res:
            ok = res.status in (200, 201)
            print(f"  {'✓' if ok else '✗'} {key} <- {filename} "
                  f"({len(body):,} bytes, HTTP {res.status})")


if __name__ == "__main__":
    main()
