#!/usr/bin/env python3
"""Regenerate sitemap.xml from the canonical tag of every page.

The canonical tag is the single source of truth, so the sitemap can never
drift from it. Run after adding or renaming pages:

    python3 build-sitemap.py

lastmod comes from git (the file's last commit date), falling back to the
filesystem mtime for files that aren't committed yet.
"""
import glob
import os
import re
import subprocess
from datetime import date, datetime, timezone

SITE = "https://emojicircle.com"
# Not real pages: GSC verification file, and anything without a canonical.
SKIP = {"google585d8a6ecd08e358.html"}


def lastmod(path):
    out = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", path],
        capture_output=True, text=True,
    ).stdout.strip()
    if out:
        return out
    return datetime.fromtimestamp(os.path.getmtime(path), timezone.utc).strftime("%Y-%m-%d")


def main():
    urls = []
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        if f in SKIP:
            continue
        html = open(f, encoding="utf-8", errors="replace").read()
        m = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', html)
        if not m:
            print(f"  skip (no canonical): {f}")
            continue
        loc = m.group(1)
        if not loc.startswith(SITE):
            print(f"  skip (foreign canonical): {f} -> {loc}")
            continue
        # Only self-referencing canonicals belong in a sitemap.
        expected = SITE + "/" if f == "index.html" else f"{SITE}/{f[:-5]}"
        if loc != expected:
            print(f"  WARNING non-self-referencing canonical: {f} -> {loc}")
        urls.append((loc, lastmod(f)))

    urls.sort(key=lambda u: (u[0] != SITE + "/", u[0]))
    body = "\n".join(
        f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{mod}</lastmod>\n  </url>"
        for loc, mod in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n"
    )
    open("sitemap.xml", "w", encoding="utf-8").write(xml)
    print(f"sitemap.xml: {len(urls)} URLs")


if __name__ == "__main__":
    main()
