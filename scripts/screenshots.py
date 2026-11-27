"""Render the card in every state and theme and save PNGs to docs/images/.

    npm run build && python3 scripts/make_demo_states.py && python3 scripts/screenshots.py

Needs Playwright for Python (`pip install playwright && playwright install chromium`).
Set CHROME_PATH to use an installed Chrome instead of Playwright's Chromium.
"""

from __future__ import annotations

import functools
import http.server
import os
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "images"


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args) -> None:
        pass


def serve() -> tuple[http.server.ThreadingHTTPServer, int]:
    handler = functools.partial(_QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, server.server_address[1]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    server, port = serve()
    try:
        with sync_playwright() as p:
            launch = {"executable_path": os.environ["CHROME_PATH"]} if os.environ.get("CHROME_PATH") else {}
            browser = p.chromium.launch(**launch)
            page = browser.new_page(viewport={"width": 1400, "height": 1000}, device_scale_factor=2)
            errors: list[str] = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.goto(f"http://127.0.0.1:{port}/scripts/harness/index.html")
            page.wait_for_selector("body[data-ready='1']", timeout=20000)
            shots = page.locator(".shot")
            for i in range(shots.count()):
                el = shots.nth(i)
                name = el.get_attribute("id")
                el.screenshot(path=str(OUT / f"{name}.png"))
                print(f"docs/images/{name}.png")
            browser.close()
            real_errors = [e for e in errors if "Failed to load resource" not in e]
            if real_errors:
                raise SystemExit("Card errors:\n" + "\n".join(real_errors))
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
