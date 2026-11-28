"""Thin async client for the (unofficial, public) EuroLeague API.

Every call to EuroLeague's servers lives in this module, so that if the API
changes shape or starts requiring a key, there is only one place to fix.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
import logging
import time
from typing import Any

import aiohttp

from .const import (
    API_BASE,
    CACHE_CLUBS,
    CACHE_GAMES,
    CACHE_LEADERS,
    CACHE_ROUNDS,
    CACHE_SEASONS,
    CACHE_STANDINGS,
    CACHE_TEAM_STATS,
    LIVE_BASE,
    LIVE_MIN_SPACING,
)

_LOGGER = logging.getLogger(__name__)

TIMEOUT = aiohttp.ClientTimeout(total=30)
USER_AGENT = "ha-euroleague-tracker (+https://github.com/Big-Edge2297/ha-euroleague-tracker)"


class EuroLeagueApiError(Exception):
    """Raised when the API can't be reached or returns an unexpected answer."""


class EuroLeagueAuthError(EuroLeagueApiError):
    """Raised when the API starts refusing anonymous access."""


@dataclass
class _CacheEntry:
    value: Any
    expires: float


@dataclass
class EuroLeagueApi:
    """Client with a small in-memory cache and live-host request spacing."""

    session: aiohttp.ClientSession
    competition: str = "E"
    _cache: dict[str, _CacheEntry] = field(default_factory=dict)
    _live_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    _last_live_call: float = 0.0

    # ------------------------------------------------------------------ basics

    async def _get_json(self, url: str, params: dict[str, Any] | None = None) -> Any:
        try:
            async with self.session.get(
                url,
                params=params,
                timeout=TIMEOUT,
                headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            ) as resp:
                if resp.status in (401, 403):
                    raise EuroLeagueAuthError(f"EuroLeague API refused access ({resp.status}) for {url}")
                if resp.status == 429:
                    raise EuroLeagueApiError("EuroLeague API rate limit reached")
                if resp.status >= 400:
                    raise EuroLeagueApiError(f"HTTP {resp.status} for {url}")
                return await resp.json(content_type=None)
        except (TimeoutError, aiohttp.ClientError) as err:
            raise EuroLeagueApiError(f"Error talking to EuroLeague API: {err}") from err
        except ValueError as err:  # invalid JSON
            raise EuroLeagueApiError(f"Invalid JSON from {url}") from err

    async def _cached(self, key: str, ttl: timedelta, url: str, params=None) -> Any:
        now = time.monotonic()
        entry = self._cache.get(key)
        if entry and entry.expires > now:
            return entry.value
        value = await self._get_json(url, params)
        self._cache[key] = _CacheEntry(value, now + ttl.total_seconds())
        return value

    def invalidate(self, prefix: str) -> None:
        """Drop cached entries whose key starts with prefix."""
        for key in [k for k in self._cache if k.startswith(prefix)]:
            del self._cache[key]

    async def _get_live(self, endpoint: str, season_code: str, game_code: int) -> Any:
        """Call live.euroleague.net, spacing requests to respect its rate limit."""
        async with self._live_lock:
            wait = LIVE_MIN_SPACING - (time.monotonic() - self._last_live_call)
            if wait > 0:
                await asyncio.sleep(wait)
            try:
                return await self._get_json(
                    f"{LIVE_BASE}/{endpoint}",
                    {"gamecode": game_code, "seasoncode": season_code},
                )
            finally:
                self._last_live_call = time.monotonic()

    # ------------------------------------------------------- competition data

    @property
    def _comp(self) -> str:
        return f"{API_BASE}/v2/competitions/{self.competition}"

    async def seasons(self) -> list[dict[str, Any]]:
        data = await self._cached("seasons", CACHE_SEASONS, f"{self._comp}/seasons")
        return data.get("data", []) if isinstance(data, dict) else []

    async def current_season(self, now: datetime | None = None) -> dict[str, Any]:
        """Return the season whose date range contains now (else the newest)."""
        now = now or datetime.now(UTC)
        seasons = await self.seasons()
        if not seasons:
            raise EuroLeagueApiError("No seasons returned by the API")
        for season in seasons:
            start = _parse_dt(season.get("startDate"))
            end = _parse_dt(season.get("endDate"))
            if start and end and start <= now <= end:
                return season
        return max(seasons, key=lambda s: s.get("year", 0))

    async def clubs(self, season_code: str) -> list[dict[str, Any]]:
        data = await self._cached(
            f"clubs:{season_code}", CACHE_CLUBS, f"{self._comp}/seasons/{season_code}/clubs"
        )
        return data.get("data", []) if isinstance(data, dict) else []

    async def rounds(self, season_code: str) -> list[dict[str, Any]]:
        data = await self._cached(
            f"rounds:{season_code}", CACHE_ROUNDS, f"{self._comp}/seasons/{season_code}/rounds"
        )
        return data.get("data", []) if isinstance(data, dict) else []

    async def games(self, season_code: str, *, force: bool = False) -> list[dict[str, Any]]:
        """All games of the season (~750 KB, so it is cached for hours)."""
        key = f"games:{season_code}"
        if force:
            self.invalidate(key)
        data = await self._cached(key, CACHE_GAMES, f"{self._comp}/seasons/{season_code}/games")
        return data.get("data", []) if isinstance(data, dict) else []

    async def past_games(self, season_code: str) -> list[dict[str, Any]]:
        """A finished season's games, not cached (callers keep only what they need)."""
        data = await self._get_json(f"{self._comp}/seasons/{season_code}/games")
        return data.get("data", []) if isinstance(data, dict) else []

    async def team_traditional(self, season_code: str) -> Any:
        """Per-game averages for every club, used to rank the team."""
        url = f"{API_BASE}/v3/competitions/{self.competition}/statistics/teams/traditional"
        params = {"seasonMode": "Single", "seasonCode": season_code, "statisticMode": "PerGame"}
        return await self._cached(f"teamtrad:{season_code}", CACHE_TEAM_STATS, url, params)

    async def standings(self, season_code: str, round_number: int, *, force=False) -> dict:
        key = f"standings:{season_code}:{round_number}"
        if force:
            self.invalidate(key)
        url = (
            f"{API_BASE}/v3/competitions/{self.competition}/seasons/{season_code}"
            f"/rounds/{round_number}/basicstandings"
        )
        data = await self._cached(key, CACHE_STANDINGS, url)
        return data if isinstance(data, dict) else {}

    async def team_stats(self, season_code: str, club_code: str) -> dict[str, Any]:
        url = f"{API_BASE}/v3/competitions/{self.competition}/seasons/{season_code}/clubs/{club_code}/stats"
        data = await self._cached(f"teamstats:{season_code}:{club_code}", CACHE_TEAM_STATS, url)
        if isinstance(data, list) and data:
            return data[0]
        return data if isinstance(data, dict) else {}

    async def leaders(self, season_code: str) -> dict[str, Any]:
        """League leaders by category (~740 KB, cached for 12 hours)."""
        url = f"{API_BASE}/v3/competitions/{self.competition}/statistics/players/leaders"
        params = {
            "seasonMode": "Single",
            "seasonCode": season_code,
            "statisticMode": "PerGame",
            "category": "Score",
        }
        data = await self._cached(f"leaders:{season_code}", CACHE_LEADERS, url, params)
        return data if isinstance(data, dict) else {}

    # -------------------------------------------------------------- live data

    async def header(self, season_code: str, game_code: int) -> dict[str, Any]:
        return await self._get_live("Header", season_code, game_code) or {}

    async def boxscore(self, season_code: str, game_code: int) -> dict[str, Any]:
        return await self._get_live("Boxscore", season_code, game_code) or {}

    async def play_by_play(self, season_code: str, game_code: int) -> dict[str, Any]:
        return await self._get_live("PlayByPlay", season_code, game_code) or {}

    async def shots(self, season_code: str, game_code: int) -> dict[str, Any]:
        """Shot locations ("Points" feed), made and missed field goals."""
        return await self._get_live("Points", season_code, game_code) or {}

    async def evolution(self, season_code: str, game_code: int) -> dict[str, Any]:
        """Score after every minute ("Evolution" feed)."""
        return await self._get_live("Evolution", season_code, game_code) or {}


def _parse_dt(value: str | None) -> datetime | None:
    """Parse API timestamps; values without an offset are treated as UTC."""
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed
