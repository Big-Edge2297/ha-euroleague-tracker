"""End-to-end: set up the integration against mocked API responses."""

from __future__ import annotations

from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
    CONF_TEAM_CODE,
    CONF_TEAM_NAME,
    DOMAIN,
    EVENT_NAME,
)

from .conftest import load, mock_api


def _entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        unique_id="E_OLY",
        title="Olympiacos Piraeus (EuroLeague)",
        data={CONF_COMPETITION: "E", CONF_TEAM_CODE: "OLY", CONF_TEAM_NAME: "Olympiacos Piraeus"},
    )


def _entity(hass: HomeAssistant, key: str) -> str:
    return er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"E_OLY_{key}")


async def test_setup_pre_game(hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    entry = _entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED

    game = hass.states.get(_entity(hass, "game"))
    assert game.state == "PRE"
    assert game.attributes["opponent_abbr"] == "ASV"
    assert game.attributes["kickoff_in"] == "in 7 days"
    assert game.attributes["previous_game"]["opponent_abbr"] == "HTA"
    assert game.attributes["previous_game"]["won"] is True

    standings = hass.states.get(_entity(hass, "standings"))
    assert standings.state == "1"
    assert standings.attributes["position_ordinal"] == "1st"
    assert len(standings.attributes["table"]) == 20

    stats = hass.states.get(_entity(hass, "stats"))
    assert float(stats.state) == 90.4
    assert stats.attributes["team_leader_ranks"][0]["name"] == "Sasha Vezenkov"
    assert stats.attributes["league_ranks"]["fg2_pct"]["rank"] == 1
    assert stats.attributes["league_ranks"]["points"] == {
        "value": 90.4,
        "rank": 4,
        "teams": 20,
        "worst": 79.5,
        "best": 96.1,
        "average": 87.1,
        "lower_is_better": False,
    }
    assert stats.attributes["attack_defence"]["scored"] == 90.4
    assert stats.attributes["attack_defence"]["allowed"] == 81.3
    form = stats.attributes["form"]
    assert len(form) == 14 and form[0]["round"] == 1 and form[-1]["margin"] == 25
    # The finished games' shots are read for the season zones, ten per update.
    assert stats.attributes["shot_zones"]["games"] == 10
    assert stats.attributes["shot_zones"]["total_games"] == 14

    h2h = game.attributes["head_to_head"]
    assert (h2h["wins"], h2h["losses"], h2h["average_margin"]) == (3, 1, 5.5)
    assert h2h["meetings"][0]["date"].startswith("2026-04-03")
    assert game.attributes["score_flow"] is None

    board = standings.attributes["scoreboard"]
    assert [r["round"] for r in board["rounds"]] == [14, 15, 16]
    assert len(board["rounds"][0]["games"]) == 10 and board["rounds"][0]["games"][0]["played"]
    assert board["crests"]["OLY"].startswith("https://")

    # Before tip-off the only live feed read is finished games' shot locations.
    live_calls = {
        str(call[1]).split("?")[0]
        for call in aioclient_mock.mock_calls
        if "//live.euroleague.net" in str(call[1])
    }
    assert live_calls == {"https://live.euroleague.net/api/Points"}

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_live_then_final_fires_events(
    hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory
):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    mock_api(aioclient_mock, live=True)
    entry = _entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    game = hass.states.get(_entity(hass, "game"))
    assert game.state == "IN"
    assert game.attributes["clock"] == "Q3 04:21"
    assert game.attributes["team_score"] == 63
    assert game.attributes["score_flow"]["team"][:3] == [2, 8, 10]
    # Live updates don't read past games' shots.
    stats = hass.states.get(_entity(hass, "stats"))
    assert stats.attributes["shot_zones"] is None
    coordinator = entry.runtime_data
    assert coordinator.update_interval == timedelta(seconds=15)

    events = async_capture_events(hass, EVENT_NAME)
    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=False, games=_games_with_140_unplayed())
    freezer.tick(timedelta(seconds=16))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    game = hass.states.get(_entity(hass, "game"))
    assert game.state == "POST"
    assert game.attributes["team_score"] == 104
    flow = game.attributes["score_flow"]
    assert (flow["largest_lead"], flow["largest_lead_minute"]) == (25, 39)
    assert (flow["largest_deficit"], flow["largest_deficit_minute"]) == (6, 12)
    kinds = [e.data["type"] for e in events]
    assert "game_final" in kinds
    final = next(e for e in events if e.data["type"] == "game_final")
    assert final.data["won"] is True
    # The three baskets scored after the last live check still fire, one each, in order,
    # with the score and clock at that basket (not the final score).
    baskets = [e.data for e in events if e.data["type"] == "team_scored"]
    assert [(b["player"], b["shot"], b["points"], b["team_score"], b["clock"]) for b in baskets] == [
        ("Evan Fournier", "two_pointer", 2, 99, "00:52"),
        ("Evan Fournier", "three_pointer", 3, 102, "00:39"),
        ("Cory Joseph", "two_pointer", 2, 104, "00:02"),
    ]


def _games_with_140_unplayed():
    games = load("games.json")
    for g in games["data"]:
        if g["gameCode"] == 140:
            g["played"] = False
    return games


async def test_api_down_retries(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    aioclient_mock.get("https://api-live.euroleague.net/v2/competitions/E/seasons", status=500)
    entry = _entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_access_refused_raises_repair_issue(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    aioclient_mock.get("https://api-live.euroleague.net/v2/competitions/E/seasons", status=401)
    entry = _entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY
    assert ir.async_get(hass).async_get_issue(DOMAIN, "api_access_refused") is not None


async def test_shot_zones_catch_up_and_survive_a_restart(
    hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory, hass_storage
):
    """The rest of the games are read a minute later, and saved for restarts."""
    from datetime import timedelta

    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from custom_components.euroleague_tracker.const import zone_store_key

    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    entry = _entry()
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    coordinator = entry.runtime_data
    stats = _entity(hass, "stats")
    assert hass.states.get(stats).attributes["shot_zones"]["games"] == 10
    assert coordinator.update_interval == timedelta(minutes=1)

    freezer.tick(timedelta(minutes=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    zones = hass.states.get(stats).attributes["shot_zones"]
    assert (zones["games"], zones["total_games"]) == (14, 14)
    assert coordinator.update_interval == timedelta(minutes=15)

    # Saved a few seconds later; a restart reads no shots again.
    freezer.tick(timedelta(seconds=15))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    saved = hass_storage[zone_store_key(entry.entry_id)]["data"]
    assert saved["team"] == "OLY" and len(saved["zones"]["E2026"]) == 14

    points_calls = lambda: sum("/api/Points" in str(c[1]) for c in aioclient_mock.mock_calls)  # noqa: E731
    before = points_calls()
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.tick(timedelta(minutes=15))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(stats).attributes["shot_zones"]["games"] == 14
    assert points_calls() == before

    # Removing the integration deletes the saved zones.
    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert zone_store_key(entry.entry_id) not in hass_storage
