"""Club crests on a light disc, so dark crests stay visible on any theme.

Home Assistant shows an entity's picture as it is, and several clubs' crests
are black or dark grey (ASVEL, Partizan, Virtus, Beşiktaş, Paris). This view
serves each crest inside a small SVG with a white circle behind it.

The images are public EuroLeague crests, so the view needs no login (the
frontend loads entity pictures with a plain <img>). It only ever serves crests
the integration has seen in EuroLeague data, from the EuroLeague image hosts;
the image is fetched once, size-limited and embedded as a raster data URI, so
nothing in the response can run script.
"""

from __future__ import annotations

import base64
import re
import time
from typing import Any
from urllib.parse import urlsplit

import aiohttp
from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN

CREST_PATH = f"/api/{DOMAIN}/crest"
CODE = re.compile(r"^[A-Z0-9]{2,5}$")
ALLOWED_HOSTS = ("media-cdn.incrowdsports.com", "media-cdn.cortextech.io")
MAX_BYTES = 512 * 1024
CACHE_SECONDS = 24 * 3600
TIMEOUT = aiohttp.ClientTimeout(total=10)


def crest_url(code: str | None) -> str | None:
    """The entity picture for a club, or None for a code we can't serve."""
    return f"{CREST_PATH}/{code}" if code and CODE.match(code) else None


def allowed_source(url: str | None) -> bool:
    """Only https images from the EuroLeague image hosts."""
    if not url:
        return False
    parts = urlsplit(url)
    return parts.scheme == "https" and parts.hostname in ALLOWED_HOSTS


@callback
def remember_crests(hass: HomeAssistant, crests: dict[str, str | None]) -> None:
    """Note the crest URL of each club seen in the API data."""
    known: dict[str, str] = hass.data.setdefault(DOMAIN, {}).setdefault("crests", {})
    for code, url in crests.items():
        if code and CODE.match(code) and allowed_source(url):
            known[code] = url  # type: ignore[assignment]


def sniff(body: bytes) -> str | None:
    """The image type from its first bytes, for the raster formats we accept."""
    if body.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if body.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return "image/webp"
    if body[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    return None


def disc_svg(image: bytes, content_type: str) -> str:
    data = base64.b64encode(image).decode("ascii")
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<circle cx="50" cy="50" r="50" fill="#ffffff"/>'
        f'<image href="data:{content_type};base64,{data}" x="14" y="14" width="72" height="72" '
        'preserveAspectRatio="xMidYMid meet"/></svg>'
    )


class CrestView(HomeAssistantView):
    """GET /api/euroleague_tracker/crest/{code}"""

    url = CREST_PATH + "/{code}"
    name = f"api:{DOMAIN}:crest"
    requires_auth = False

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._cache: dict[str, tuple[float, str]] = {}

    async def get(self, request: web.Request, code: str) -> web.Response:
        if not CODE.match(code):
            return web.Response(status=404)
        source = (self.hass.data.get(DOMAIN) or {}).get("crests", {}).get(code)
        if not allowed_source(source):
            return web.Response(status=404)
        cached = self._cache.get(code)
        if cached is None or time.monotonic() - cached[0] > CACHE_SECONDS:
            svg = await self._fetch(source)
            if svg is None:
                return web.Response(status=502)
            cached = (time.monotonic(), svg)
            self._cache[code] = cached
        return web.Response(
            text=cached[1],
            content_type="image/svg+xml",
            headers={
                "Cache-Control": f"public, max-age={CACHE_SECONDS}",
                "X-Content-Type-Options": "nosniff",
                "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'none'",
            },
        )

    async def _fetch(self, source: str) -> str | None:
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(source, timeout=TIMEOUT, allow_redirects=False) as resp:
                if resp.status != 200:
                    return None
                body = await resp.content.read(MAX_BYTES + 1)
        except (aiohttp.ClientError, TimeoutError):
            return None
        if not body or len(body) > MAX_BYTES:
            return None
        # Go by the bytes, not the header: CDNs label images inconsistently, and
        # only plain raster images are ever embedded (never SVG or HTML).
        content_type = sniff(body)
        return disc_svg(body, content_type) if content_type else None


def crests_from(data: Any) -> dict[str, str | None]:
    """Every club crest in one update's data (standings, round scoreboard, game)."""
    out: dict[str, str | None] = {}
    for row in getattr(data, "standings", None) or []:
        out[row.get("code")] = row.get("crest")
    out.update((getattr(data, "scoreboard", None) or {}).get("crests", {}))
    game = getattr(data, "game", None) or {}
    out[game.get("team_abbr")] = game.get("team_logo")
    out[game.get("opponent_abbr")] = game.get("opponent_logo")
    return out
