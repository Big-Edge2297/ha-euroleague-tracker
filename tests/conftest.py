"""Shared test helpers.

Fixtures in tests/fixtures/ are trimmed copies of real EuroLeague API
responses captured on 27 Nov 2026 (same field names and value formats).
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
import re
from typing import Any

import pytest

from custom_components.euroleague_tracker.const import API_BASE, LIVE_BASE

FIXTURES = Path(__file__).parent / "fixtures"


def load(name: str) -> Any:
    return json.loads((FIXTURES / name).read_text())


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture(autouse=True)
def no_live_spacing(monkeypatch):
    """The live-host request spacing sleeps, which never ends with a frozen clock."""
    monkeypatch.setattr("custom_components.euroleague_tracker.api.LIVE_MIN_SPACING", 0)


def mock_api(
    aioclient_mock, *, live: bool = False, games: dict | None = None, feeds: dict | None = None
) -> None:
    """Register every endpoint the integration calls.

    live=True makes game 140 look in progress (Q3 04:21, 63-58).
    feeds overrides live-feed answers by endpoint name ("Header", "PlayByPlay").
    """
    games = games if games is not None else load("games.json")
    if live:
        games = copy.deepcopy(games)
        for g in games["data"]:
            if g["gameCode"] == 140:
                g["played"] = False
    comp = f"{API_BASE}/v2/competitions/E"
    aioclient_mock.get(f"{comp}/seasons", json=load("seasons.json"))
    aioclient_mock.get(f"{comp}/seasons/E2026/clubs", json=load("clubs.json"))
    aioclient_mock.get(f"{comp}/seasons/E2026/rounds", json=load("rounds.json"))
    aioclient_mock.get(f"{comp}/seasons/E2026/games", json=games)
    v3 = f"{API_BASE}/v3/competitions/E"
    aioclient_mock.get(
        re.compile(rf"{re.escape(v3)}/seasons/E2026/rounds/\d+/basicstandings"),
        json=load("standings_r14.json"),
    )
    aioclient_mock.get(f"{v3}/seasons/E2026/clubs/OLY/stats", json=load("team_stats_oly.json"))
    aioclient_mock.get(f"{v3}/statistics/players/leaders", json=load("leaders.json"))
    feeds = feeds or {}
    suffix = "live" if live else "final"
    aioclient_mock.get(f"{LIVE_BASE}/Header", json=feeds.get("Header", load(f"header_140_{suffix}.json")))
    # No real mid-game box score was captured, so the live box score is empty.
    aioclient_mock.get(f"{LIVE_BASE}/Boxscore", json={} if live else load("boxscore_140.json"))
    aioclient_mock.get(
        f"{LIVE_BASE}/PlayByPlay", json=feeds.get("PlayByPlay", load(f"pbp_140_{suffix}.json"))
    )
    aioclient_mock.get(f"{LIVE_BASE}/Points", json=load("points_140.json"))
