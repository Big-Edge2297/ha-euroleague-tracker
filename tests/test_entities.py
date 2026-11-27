"""The v0.2.0 entities: sensors, the Live binary sensor and the event entities."""

from __future__ import annotations

import copy
from datetime import timedelta

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
    CONF_EVENT_DELAY,
    CONF_TEAM_CODE,
    CONF_TEAM_NAME,
    DOMAIN,
    EVENT_NAME,
)

from .conftest import load, mock_api

PREFIX = "olympiacos_piraeus_euroleague"
# key -> entity id suffix (the id comes from the translated name)
DISABLED = {
    "last_result": "last_result",
    "record": "record",
    "streak": "streak",
    "point_diff": "point_difference",
    "games_behind_playoffs": "games_behind_playoffs",
}
ASVEL_CREST = "https://media-cdn.incrowdsports.com/e33c6d1a-95ca-4dbc-b8cb-0201812104cc.png"


def _entry(options: dict | None = None) -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        unique_id="E_OLY",
        title="Olympiacos Piraeus (EuroLeague)",
        data={CONF_COMPETITION: "E", CONF_TEAM_CODE: "OLY", CONF_TEAM_NAME: "Olympiacos Piraeus"},
        options=options or {},
    )


async def _setup(hass, entry) -> None:
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def _tick(hass, freezer, seconds: float) -> None:
    freezer.tick(timedelta(seconds=seconds))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


def _live_pbp(q3_plays: int | None = None, extra: list | None = None) -> dict:
    """The real Q3 excerpt (up to Vezenkov's basket at 04:21), optionally cut or extended."""
    pbp = load("pbp_140_live.json")
    if q3_plays is not None:
        pbp["ThirdQuarter"] = pbp["ThirdQuarter"][:q3_plays]
    pbp["ThirdQuarter"] += extra or []
    return pbp


HTA_THREE = {  # an opponent basket right after Vezenkov's, for the two-basket test
    "TYPE": 0,
    "NUMBEROFPLAY": 307,
    "CODETEAM": "HTA       ",
    "PLAYER_ID": "",
    "PLAYTYPE": "3FGM",
    "PLAYER": "BLAKENEY, ANTONIO",
    "TEAM": None,
    "DORSAL": None,
    "MINUTE": 26,
    "MARKERTIME": "04:05",
    "POINTS_A": 63,
    "POINTS_B": 61,
    "COMMENT": "",
    "PLAYINFO": "Three Pointer (2/6 -  12 pt)",
}


def _games_with_140_unplayed() -> dict:
    games = load("games.json")
    for g in games["data"]:
        if g["gameCode"] == 140:
            g["played"] = False
    return games


# --------------------------------------------------------------- sensors


async def test_entities_before_tip_off(hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    await _setup(hass, _entry())

    assert hass.states.get(f"sensor.{PREFIX}_next_game").state == "2026-12-04T19:15:00+00:00"
    assert hass.states.get(f"sensor.{PREFIX}_next_game").attributes["opponent_abbr"] == "ASV"
    assert hass.states.get(f"sensor.{PREFIX}_game_status").state == "upcoming"
    assert hass.states.get(f"binary_sensor.{PREFIX}_live").state == "off"
    assert hass.states.get(f"sensor.{PREFIX}_team_score").state == "unknown"
    opponent = hass.states.get(f"sensor.{PREFIX}_opponent")
    assert opponent.state == "LDLC ASVEL"
    assert opponent.attributes["entity_picture"] == ASVEL_CREST
    assert opponent.attributes["record"] == "4-10"
    for key in ("team_scored", "opponent_scored", "game_events"):
        assert hass.states.get(f"event.{PREFIX}_{key}").state == "unknown"  # nothing fired yet

    # The detail sensors exist but start disabled.
    registry = er.async_get(hass)
    for suffix in DISABLED.values():
        entry = registry.async_get(f"sensor.{PREFIX}_{suffix}")
        assert entry is not None and entry.disabled_by is er.RegistryEntryDisabler.INTEGRATION, suffix
        assert hass.states.get(f"sensor.{PREFIX}_{suffix}") is None


async def test_disabled_sensors_when_enabled(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    registry = er.async_get(hass)
    entry = _entry()
    entry.add_to_hass(hass)
    for key, suffix in DISABLED.items():  # as if the user had enabled them
        registry.async_get_or_create(
            "sensor", DOMAIN, f"E_OLY_{key}", suggested_object_id=f"{PREFIX}_{suffix}", config_entry=entry
        )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    value = lambda key: hass.states.get(f"sensor.{PREFIX}_{key}").state  # noqa: E731
    assert value("last_result") == "W 104-79 vs HTA"
    assert value("record") == "11-3"
    assert value("streak") == "W4"
    assert value("point_difference") == "116"
    assert value("games_behind_playoffs") == "0.0"
    assert hass.states.get(f"sensor.{PREFIX}_games_behind_playoffs").attributes["games_behind_play_in"] == 0.0


async def test_entities_during_and_after_a_game(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    mock_api(aioclient_mock, live=True)
    await _setup(hass, _entry())

    assert hass.states.get(f"binary_sensor.{PREFIX}_live").state == "on"
    assert hass.states.get(f"sensor.{PREFIX}_game_status").state == "live"
    assert hass.states.get(f"sensor.{PREFIX}_team_score").state == "63"
    assert hass.states.get(f"sensor.{PREFIX}_opponent_score").state == "58"
    assert hass.states.get(f"sensor.{PREFIX}_next_game").state == "2026-12-04T19:15:00+00:00"

    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, games=_games_with_140_unplayed())
    await _tick(hass, freezer, 16)

    assert hass.states.get(f"binary_sensor.{PREFIX}_live").state == "off"
    assert hass.states.get(f"sensor.{PREFIX}_game_status").state == "final"
    assert hass.states.get(f"sensor.{PREFIX}_team_score").state == "104"
    game_events = hass.states.get(f"event.{PREFIX}_game_events")
    assert game_events.attributes["event_type"] == "game_final"
    assert game_events.attributes["won"] is True


# --------------------------------------------------------- basket events


async def test_two_baskets_in_one_update_fire_in_order(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    # First look at the game mid-way (as after a restart): only the free throw so far.
    mock_api(aioclient_mock, live=True, feeds={"PlayByPlay": _live_pbp(q3_plays=1)})
    await _setup(hass, _entry())
    bus = async_capture_events(hass, EVENT_NAME)
    entity_changes = []

    @callback
    def _record(event) -> None:  # a callback runs inline, so the order is kept
        if event.data["entity_id"].startswith("event."):
            entity_changes.append(event.data["entity_id"])

    hass.bus.async_listen("state_changed", _record)

    # Next update: Vezenkov's two and then a Hapoel three, both new.
    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=True, feeds={"PlayByPlay": _live_pbp(extra=[HTA_THREE])})
    await _tick(hass, freezer, 16)

    scored = [e.data for e in bus if e.data["type"] in ("team_scored", "opponent_scored")]
    assert [(s["type"], s["player"], s["shot"], s["team_score"], s["opponent_score"]) for s in scored] == [
        ("team_scored", "Sasha Vezenkov", "two_pointer", 63, 58),
        ("opponent_scored", "Antonio Blakeney", "three_pointer", 63, 61),
    ]
    assert entity_changes == [f"event.{PREFIX}_team_scored", f"event.{PREFIX}_opponent_scored"]
    team = hass.states.get(f"event.{PREFIX}_team_scored")
    assert team.attributes["event_type"] == "two_pointer"
    assert (team.attributes["player"], team.attributes["points"], team.attributes["clock"]) == (
        "Sasha Vezenkov",
        2,
        "04:21",
    )
    assert "entry_id" not in team.attributes
    assert hass.states.get(f"event.{PREFIX}_opponent_scored").attributes["event_type"] == "three_pointer"

    # The same plays on the next update fire nothing again.
    bus.clear()
    await _tick(hass, freezer, 16)
    assert not [e for e in bus if e.data["type"].endswith("_scored")]


async def test_restart_mid_game_fires_no_old_baskets(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    bus = async_capture_events(hass, EVENT_NAME)
    mock_api(aioclient_mock, live=True)
    await _setup(hass, _entry())
    assert not [e for e in bus if e.data["type"].endswith("_scored")]
    assert hass.states.get(f"event.{PREFIX}_team_scored").state == "unknown"


async def test_baskets_between_pre_game_and_first_live_check_fire(
    hass: HomeAssistant, aioclient_mock, freezer
):
    freezer.move_to("2026-11-25T18:16:00+00:00")  # a minute after tip-off, feed not live yet
    pre_header = {**load("header_140_live.json"), "Live": False, "ScoreA": "0", "ScoreB": "0"}
    mock_api(aioclient_mock, live=True, feeds={"Header": pre_header})
    await _setup(hass, _entry())
    assert hass.states.get(f"sensor.{PREFIX}_game_status").state == "upcoming"
    bus = async_capture_events(hass, EVENT_NAME)

    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=True)  # now live, with two baskets in the feed
    await _tick(hass, freezer, 61)

    kinds = [e.data["type"] for e in bus]
    assert kinds.count("team_scored") == 2  # Fournier's free throw, Vezenkov's two
    assert "game_started" in kinds


async def test_delay_holds_events_back(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    mock_api(aioclient_mock, live=True, feeds={"PlayByPlay": _live_pbp(q3_plays=1)})
    await _setup(hass, _entry({CONF_EVENT_DELAY: 30}))
    bus = async_capture_events(hass, EVENT_NAME)

    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=True)
    await _tick(hass, freezer, 16)  # Vezenkov's basket is seen...
    assert not [e for e in bus if e.data["type"] == "team_scored"]
    assert hass.states.get(f"event.{PREFIX}_team_scored").state == "unknown"

    await _tick(hass, freezer, 31)  # ...and fires 30 s later
    assert [e.data["player"] for e in bus if e.data["type"] == "team_scored"] == ["Sasha Vezenkov"]
    assert hass.states.get(f"event.{PREFIX}_team_scored").attributes["player"] == "Sasha Vezenkov"


async def test_unload_drops_delayed_events(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-25T19:05:00+00:00")
    mock_api(aioclient_mock, live=True, feeds={"PlayByPlay": _live_pbp(q3_plays=1)})
    entry = _entry({CONF_EVENT_DELAY: 30})
    await _setup(hass, entry)
    bus = async_capture_events(hass, EVENT_NAME)

    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=True)
    await _tick(hass, freezer, 16)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await _tick(hass, freezer, 60)
    assert not [e for e in bus if e.data["type"] == "team_scored"]


async def test_other_bus_events_still_fire(hass: HomeAssistant, aioclient_mock, freezer):
    """Quarter ends and lead changes keep working for existing automations."""
    freezer.move_to("2026-11-25T19:05:00+00:00")
    header = copy.deepcopy(load("header_140_live.json"))
    header.update({"ScoreA": "58", "ScoreB": "60", "Quarter": "2"})  # trailing, in Q2
    mock_api(aioclient_mock, live=True, feeds={"Header": header})
    await _setup(hass, _entry())
    bus = async_capture_events(hass, EVENT_NAME)

    aioclient_mock.clear_requests()
    mock_api(aioclient_mock, live=True)  # Q3, leading 63-58
    await _tick(hass, freezer, 16)
    kinds = {e.data["type"]: e.data for e in bus}
    assert kinds["quarter_end"]["quarter"] == 2
    assert kinds["lead_change"]["leader"] == "team"
    assert hass.states.get(f"event.{PREFIX}_game_events").attributes["event_type"] in (
        "quarter_end",
        "lead_change",
    )
