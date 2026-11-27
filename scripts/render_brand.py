"""Render the brand images and the README banner from docs/brand/icon.svg.

    python scripts/render_brand.py

Writes:
- custom_components/euroleague_tracker/brand/{icon,logo,dark_logo}[@2x].png
  (shown by Home Assistant 2026.3+ and in HACS)
- docs/images/banner.png (top of the README)

Needs Playwright for Python and the Inter font; set CHROME_PATH to use an
installed Chrome instead of Playwright's Chromium.
"""

from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ICON = (ROOT / "docs" / "brand" / "icon.svg").read_text()
ICON_INNER = ICON.split(">", 1)[1].rsplit("</svg>", 1)[0].split("-->", 1)[-1]
BRAND = ROOT / "custom_components" / "euroleague_tracker" / "brand"
IMAGES = ROOT / "docs" / "images"
FONT = "Inter, 'Inter Display', Roboto, Arial, sans-serif"


def logo_svg(text_color: str) -> str:
    # Icon plus a two-line wordmark; 760 x 256 at @2x.
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 256" width="760" height="256">
  {ICON_INNER}
  <text x="290" y="120" font-family="{FONT}" font-size="76" font-weight="700" fill="{text_color}" letter-spacing="-1.5">EuroLeague</text>
  <text x="290" y="204" font-family="{FONT}" font-size="76" font-weight="400" fill="{text_color}" letter-spacing="-1">Tracker</text>
</svg>"""


def banner_svg() -> str:
    # 1600 x 400. Court lines echo the icon on the right, very faint.
    court = """
  <g fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="10" stroke-linejoin="round">
    <rect x="1010" y="-40" width="720" height="480" rx="40"/>
    <line x1="1370" y1="-40" x2="1370" y2="440"/>
    <circle cx="1370" cy="200" r="90"/>
    <path d="M1010 110 L1180 110 L1180 290 L1010 290"/>
    <path d="M1010 40 L1080 40 A190 190 0 0 1 1080 360 L1010 360"/>
  </g>"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 400" width="1600" height="400">
  <rect width="1600" height="400" fill="#14171D"/>{court}
  <g transform="translate(96 72) scale(1)">{ICON_INNER}</g>
  <text x="404" y="178" font-family="{FONT}" font-size="92" font-weight="700" fill="#FFFFFF" letter-spacing="-2">EuroLeague Tracker</text>
  <text x="408" y="248" font-family="{FONT}" font-size="34" font-weight="400" fill="#C3C8D1">Live scores, standings and stats for your team, in Home Assistant</text>
  <text x="408" y="306" font-family="{FONT}" font-size="24" font-weight="600" fill="#E07A45" letter-spacing="1.5">EUROLEAGUE · EUROCUP</text>
</svg>"""


def render(page, svg: str, w: int, h: int, out: Path) -> None:
    page.set_viewport_size({"width": w, "height": h})
    sized = svg.replace('width="', 'data-w="', 1).replace('height="', 'data-h="', 1)
    page.set_content(
        "<html><body style='margin:0;background:transparent'>"
        f"<div style='width:{w}px;height:{h}px'>{sized.replace('<svg ', f'<svg width="{w}" height="{h}" ', 1)}</div>"
        "</body></html>"
    )
    page.evaluate("document.fonts.ready")
    page.screenshot(path=str(out), omit_background=True)
    print(out.relative_to(ROOT))


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)
    jobs = [
        (ICON, 256, 256, BRAND / "icon.png"),
        (ICON, 512, 512, BRAND / "icon@2x.png"),
        (logo_svg("#1F1F1F"), 380, 128, BRAND / "logo.png"),
        (logo_svg("#1F1F1F"), 760, 256, BRAND / "logo@2x.png"),
        (logo_svg("#F2F2F2"), 380, 128, BRAND / "dark_logo.png"),
        (logo_svg("#F2F2F2"), 760, 256, BRAND / "dark_logo@2x.png"),
        (banner_svg(), 1600, 400, IMAGES / "banner.png"),
    ]
    with sync_playwright() as p:
        launch = {"executable_path": os.environ["CHROME_PATH"]} if os.environ.get("CHROME_PATH") else {}
        browser = p.chromium.launch(**launch)
        page = browser.new_page()
        for svg, w, h, out in jobs:
            render(page, svg, w, h, out)
        browser.close()


if __name__ == "__main__":
    main()
