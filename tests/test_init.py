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

    # Live feeds aren't touched before tip-off.
    assert not any("//live.euroleague.net" in str(call[1]) for call in aioclient_mock.mock_calls)

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
