#!/usr/bin/env python3
"""Dev preview server: serves the current directory with no-store cache headers.

Plain ``http.server`` lets browsers cache JS/CSS aggressively, so edits appear
"not applied" until a hard refresh. Sending ``Cache-Control: no-store`` avoids that.

Usage: python3 serve.py [PORT]   (default 12000)
"""
import functools
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 12000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):  # keep the console quiet
        pass


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=".")
    with ReusableTCPServer(("0.0.0.0", PORT), handler) as httpd:
        print(f"Serving on http://localhost:{PORT}/ (no-store)")
        httpd.serve_forever()
