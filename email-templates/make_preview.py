#!/usr/bin/env python3
"""Builds one self-contained preview page of every email template.

Run:  python3 email-templates/make_preview.py
Output: public/email-preview.html, which the site serves at /email-preview.html.

The page is index.html (the local preview) with every template and the two
logo images packed inside it, so it opens anywhere with no other files. Run
build_emails.py first if a template changed.
"""
import base64
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "email-preview.html")
IMG_HOST = "https://d1m4vp65okes21.cloudfront.net/t/o/2034/e/"
LOGOS = [("141668-WH_Emailhead_2.jpg", "image/jpeg"), ("141668-WH_Logo_WH_Logo_White.png", "image/png")]


def swap(text, old, new):
    assert text.count(old) == 1, "index.html changed: expected exactly one of " + repr(old[:60])
    return text.replace(old, new)


def main():
    with open(os.path.join(HERE, "index.html"), encoding="utf-8") as f:
        page = f.read()

    emails = {}
    for path in sorted(glob.glob(os.path.join(HERE, "emails", "*.html"))):
        with open(path, encoding="utf-8") as f:
            emails[os.path.basename(path)[:-5]] = f.read()

    logos = {}
    for name, mime in LOGOS:
        with open(os.path.join(HERE, "preview-assets", name), "rb") as f:
            logos[IMG_HOST + name] = "data:" + mime + ";base64," + base64.b64encode(f.read()).decode()

    data = ("const EMAILS = " + json.dumps(emails).replace("</", "<\\/") + ";\n"
            "const LOGO_DATA = " + json.dumps(logos) + ";\n")

    page = swap(page, "<script>\n", "<script>\n" + data)
    page = swap(page,
                '  const res = await fetch("emails/" + current + ".html", { cache: "no-store" });\n'
                '  let html = await res.text();',
                '  let html = EMAILS[current];')
    # The emails load their logos from Window Hero's image host. Copies packed
    # into this page are used instead, so the preview works offline. The
    # manager photo on the commercial proposal is hosted elsewhere and is
    # shown as a plain circle.
    page = swap(page, "  frame.srcdoc = html;",
                "  for (const url in LOGO_DATA) html = html.split(url).join(LOGO_DATA[url]);\n"
                "  html = html.replace(/<img src=\"https:\\/\\/i\\.ibb\\.co[^\"]*\"[^>]*>/g, "
                "'<div style=\"width:100px; height:100px; border-radius:50px; background:#d9e2ec; "
                "border:3px solid #003b64; margin:0 auto;\"></div>');\n"
                "  frame.srcdoc = html;")
    page = swap(page, '<meta name="viewport" content="width=device-width, initial-scale=1">\n',
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<meta name="robots" content="noindex, nofollow">\n')

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(page)
    print("wrote", os.path.relpath(OUT), len(emails), "templates,", round(len(page.encode("utf-8")) / 1024), "KB")


if __name__ == "__main__":
    main()
