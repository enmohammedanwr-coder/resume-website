#!/usr/bin/env python3
"""Generate an ADMIN_PASSWORD_HASH value for Cloudflare Pages.

Usage:
    python3 tools/admin/make-admin-hash.py

You will be asked to type a password (not echoed). The output is a single
line you paste into Cloudflare Pages → Settings → Environment variables as
ADMIN_PASSWORD_HASH. The plaintext password is never written to disk.
"""
import base64
import getpass
import hashlib
import os

ITERATIONS = 210_000
KEY_LEN = 32


def main() -> None:
    pw = getpass.getpass("Admin password: ")
    if len(pw) < 8:
        raise SystemExit("Password must be at least 8 characters.")
    confirm = getpass.getpass("Confirm password: ")
    if pw != confirm:
        raise SystemExit("Passwords do not match.")

    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, ITERATIONS, dklen=KEY_LEN)
    value = "pbkdf2${}${}${}".format(
        ITERATIONS,
        base64.b64encode(salt).decode(),
        base64.b64encode(digest).decode(),
    )
    print("\nADMIN_PASSWORD_HASH=" + value)
    print("\nCopy the whole line above into Cloudflare Pages environment variables.")


if __name__ == "__main__":
    main()
