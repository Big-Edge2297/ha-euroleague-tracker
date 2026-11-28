"""v0.4.0: play-in, playoffs, Final Four, playoff race and calendar.

The postseason fixtures are the real 2025-26 games (play-in, the four
best-of-five series and the Final Four in Athens) and the final
regular-season table, so every series score and seed here is real.
Only venue capacities (other than Athens) and Palau Blaugrana's venue code
were not captured and are left empty or made up.
"""

from __future__ import annotations

import copy
from datetime import UTC, datetime

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.euroleague_tracker import parser
from custom_components.euroleague_tracker.const import (
    API_BASE,
    CONF_COMPETITION,
    CONF_TEAM_CODE,
    CONF_TEAM_NAME,
    DOMAIN,
    LIVE_BASE,
)

from .conftest import load

POST = load("games_E2025_postseason.json")["data"]
TABLE = parser.parse_standings(load("standings_E2025_r38.json"))
SEEDS = parser.standings_by_code(TABLE)


def as_of(now: str, *, final_four: bool = True) -> list[dict]:
    """The postseason as the API showed it at `now`: later games unplayed, no score."""
    when = datetime.fromisoformat(now)
    out = []
    for g in copy.deepcopy(POST):
        if not final_four and parser.phase_code(g) == "FF":
            continue
        if parser.game_start(g) > when:
            g["played"] = False
            g["local"]["score"] = g["road"]["score"] = 0
        out.append(g)
    return out


# ------------------------------------------------------------------ parser


def test_round_names_for_every_stage():
    labels = {g["gameCode"]: parser.game_label(g, POST) for g in POST}
    assert labels[381] == "Play-in · 7th v 8th"
    assert labels[382] == "Play-in · 9th v 10th"
    assert labels[383] == "Play-in · for 8th place"
    assert labels[384] == "Playoffs · Game 1"
    assert labels[392] == "Playoffs · Game 3"
    assert labels[403] == "Playoffs · Game 5"
    assert labels[404] == labels[405] == "Final Four · Semifinal"
    assert labels[406] == "Final Four · Championship game"
    regular = {"phaseType": {"code": "RS"}, "round": 14}
    assert parser.game_label(regular, []) is None


def test_series_score_as_it_stood_after_each_game():
    pam = parser.team_games(POST, "PAM")
    by_code = {g["gameCode"]: g for g in pam}
    status = {c: parser.series_state(pam, by_code[c], "PAM")["status"] for c in (387, 391, 395, 399, 403)}
    # Valencia lost the first two at home, then won three in a row.
    assert status == {
        387: "PAN lead 1-0",
        391: "PAN lead 2-0",
        395: "PAN lead 2-1",
        399: "Series tied 2-2",
        403: "PAM win the series 3-2",
    }
    final = parser.series_state(pam, by_code[403], "PAM")
    assert (final["game_number"], final["wins"], final["opponent_wins"], final["decided"]) == (5, 3, 2, True)
    assert [g["won"] for g in final["games"]] == [False, False, True, True, True]
    assert parser.series_state(pam, by_code[405], "PAM") is None  # Final Four is one game


def test_unneeded_games_of_a_decided_series_are_dropped():
    games = parser.team_games(POST, "OLY")
    extra = copy.deepcopy(next(g for g in games if g["gameCode"] == 392))
    extra.update(gameCode=396, played=False, utcDate="2026-05-07T18:00:00Z", date="2026-05-07T18:00:00")
    extra["local"]["score"] = extra["road"]["score"] = 0
    kept = parser.drop_unneeded([*games, extra], "OLY")
    assert 396 not in [g["gameCode"] for g in kept]
    # While the series is still open, Game 4 stays.
    early = [g for g in games if g["gameCode"] in (384, 388)] + [extra]
    assert 396 in [g["gameCode"] for g in parser.drop_unneeded(early, "OLY")]


def test_postseason_attributes_seeds_and_neutral_final_four():
    oly = parser.team_games(POST, "OLY")
    semi = next(g for g in oly if g["gameCode"] == 404)
    attrs = parser.postseason_attributes(semi, oly, "OLY", SEEDS)
    assert attrs["round_name"] == "Final Four · Semifinal"
    assert attrs["neutral_site"] is True
    assert (attrs["team_seed"], attrs["opponent_seed"]) == (1, 4)
    assert attrs["series"] is None
    g3 = next(g for g in oly if g["gameCode"] == 392)
    assert parser.postseason_attributes(g3, oly, "OLY", SEEDS)["neutral_site"] is False


def test_bracket_from_the_real_2025_26_postseason():
    b = parser.parse_bracket(POST, TABLE)
    assert [(p["home"], p["away"], p["winner"], p["label"]) for p in b["play_in"]] == [
        ("PAN", "MCO", "PAN", "7th v 8th"),
        ("BAR", "RED", "BAR", "9th v 10th"),
        ("MCO", "BAR", "MCO", "for 8th place"),
    ]
    series = {s["group"]: s for s in b["playoffs"]}
    assert [
        (
            s["top"]["code"],
            s["top"]["seed"],
            s["top"]["wins"],
            s["bottom"]["code"],
            s["bottom"]["seed"],
            s["bottom"]["wins"],
        )
        for s in b["playoffs"]
    ] == [
        ("OLY", 1, 3, "MCO", 8, 0),
        ("ULK", 4, 3, "ZAL", 5, 1),
        ("MAD", 3, 3, "HTA", 6, 1),
        ("PAM", 2, 3, "PAN", 7, 2),
    ]
    assert len(series["D"]["games"]) == 5
    ff = b["final_four"]
    assert [(s["home"], s["home_score"], s["away"], s["away_score"]) for s in ff["semifinals"]] == [
        ("OLY", 79, "ULK", 61),
        ("PAM", 90, "MAD", 105),
    ]
    assert (ff["final"]["winner"], ff["third_place"], ff["venue"]) == ("OLY", None, "TELEKOM CENTER ATHENS")
    assert b["champion"] == "OLY"
    assert parser.parse_bracket(load("games.json")["data"], TABLE) is None  # regular season only


def test_bracket_mid_playoffs_keeps_open_series_games():
    b = parser.parse_bracket(as_of("2026-05-06T00:00:00+00:00", final_four=False), TABLE)
    d = next(s for s in b["playoffs"] if s["group"] == "D")
    assert (d["top"]["wins"], d["bottom"]["wins"], d["winner"]) == (0, 2, None)
    assert b["final_four"]["final"] is None and b["champion"] is None


def test_standings_stop_at_the_regular_season():
    rounds = load("rounds_E2025.json")["data"]
    assert parser.current_round(rounds, datetime(2026, 5, 5, tzinfo=UTC)) == 38
    assert parser.current_round(rounds, datetime(2026, 4, 10, tzinfo=UTC)) == 37


def _row(pos, code, wins, losses):
    return {"position": pos, "code": code, "wins": wins, "losses": losses}


def test_playoff_race_lines_clinched_and_eliminated():
    rows = parser.parse_standings(load("standings_r14.json"))
    race = parser.playoff_race(rows, load("games.json")["data"], "OLY")
    assert race["playoffs"] == {"line": 6, "status": "in", "inside": True, "games": 3.0, "rival": "RED"}
    assert race["play_in"] == {"line": 10, "status": "in", "inside": True, "games": 3.0, "rival": "PRS"}
    behind = parser.playoff_race(rows, load("games.json")["data"], "HTA")["playoffs"]
    assert (behind["status"], behind["inside"], behind["games"], behind["rival"]) == (
        "out",
        False,
        1.0,
        "MAD",
    )

    # Two rounds left: 1st can't be caught by six teams; 12th can't reach the top ten.
    table = [_row(i + 1, f"T{i:02d}", 40 - 2 * i, 2 * i) for i in range(12)]
    left = [
        {
            "phaseType": {"code": "RS"},
            "played": False,
            "utcDate": "2027-04-15T18:00:00Z",
            "local": {"club": {"code": a}},
            "road": {"club": {"code": b}},
        }
        for a, b in [
            ("T00", "T11"),
            ("T01", "T10"),
            ("T02", "T09"),
            ("T03", "T08"),
            ("T04", "T07"),
            ("T05", "T06"),
        ]
        * 2
    ]
    assert parser.playoff_race(table, left, "T00")["playoffs"]["status"] == "clinched"
    assert parser.playoff_race(table, left, "T11")["play_in"]["status"] == "eliminated"
    # 7th (28 wins, 30 at most) can still catch 6th (30): out, not eliminated.
    assert parser.playoff_race(table, left, "T06")["playoffs"]["status"] == "out"
    assert parser.playoff_race(table, left, "T07")["playoffs"]["status"] == "eliminated"
    assert parser.playoff_race(table, left, "T00")["games_remaining"] == 2
    assert parser.playoff_race([], left, "T00") is None


def test_calendar_events_home_team_first_with_results():
    oly = parser.team_games(POST, "OLY")
    events = parser.calendar_events(oly, "OLY", "EuroLeague")
    assert [e["summary"] for e in events] == [
        "Olympiacos vs Monaco",
        "Olympiacos vs Monaco",
        "Monaco vs Olympiacos",
        "Olympiacos vs Fenerbahce",
        "Olympiacos vs Real",
    ]
    g3 = events[2]
    assert g3["description"] == "EuroLeague · Playoffs · Game 3\nW 105-82 @ MCO"
    assert g3["location"] == "Salle Gaston Medecin"
    assert g3["uid"] == "E2025_392"
    assert (g3["end"] - g3["start"]).total_seconds() == 2.25 * 3600


# ------------------------------------------------------- integration


def _mock_e2025(aioclient_mock, games):
    comp = f"{API_BASE}/v2/competitions/E"
    v3 = f"{API_BASE}/v3/competitions/E"
    aioclient_mock.get(f"{comp}/seasons", json=load("seasons.json"))
    aioclient_mock.get(f"{comp}/seasons/E2025/rounds", json=load("rounds_E2025.json"))
    aioclient_mock.get(f"{comp}/seasons/E2025/games", json={"data": games})
    aioclient_mock.get(f"{comp}/seasons/E2024/games", json=load("games_E2024.json"))
    aioclient_mock.get(f"{v3}/seasons/E2025/rounds/38/basicstandings", json=load("standings_E2025_r38.json"))
    aioclient_mock.get(f"{v3}/seasons/E2025/clubs/OLY/stats", json=[])
    aioclient_mock.get(f"{v3}/statistics/players/leaders", json={})
    aioclient_mock.get(f"{v3}/statistics/teams/traditional", json={})
    for feed in ("Header", "Boxscore", "PlayByPlay", "Points", "Evolution"):
        aioclient_mock.get(f"{LIVE_BASE}/{feed}", json={})


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id="E_OLY",
        title="Olympiacos Piraeus (EuroLeague)",
        data={CONF_COMPETITION: "E", CONF_TEAM_CODE: "OLY", CONF_TEAM_NAME: "Olympiacos Piraeus"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _state(hass, platform, key):
    return hass.states.get(er.async_get(hass).async_get_entity_id(platform, DOMAIN, f"E_OLY_{key}"))


async def test_playoff_game_three_final(hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory):
    freezer.move_to("2026-05-05T21:00:00+00:00")
    _mock_e2025(aioclient_mock, as_of("2026-05-05T21:00:00+00:00", final_four=False))
    await _setup(hass)

    game = _state(hass, "sensor", "game")
    assert game.state == "POST"
    a = game.attributes
    assert a["round_name"] == "Playoffs · Game 3"
    assert a["phase_code"] == "PO"
    assert a["series"]["status"] == "OLY win the series 3-0"
    assert (a["team_seed"], a["opponent_seed"], a["neutral_site"]) == (1, 8, False)

    standings = _state(hass, "sensor", "standings")
    assert standings.state == "1"  # the final regular-season table
    bracket = standings.attributes["bracket"]
    assert [s["winner"] for s in bracket["playoffs"]] == ["OLY", None, None, None]


async def test_final_four_semifinal_upcoming(
    hass: HomeAssistant, aioclient_mock, freezer: FrozenDateTimeFactory
):
    freezer.move_to("2026-05-21T12:00:00+00:00")
    _mock_e2025(aioclient_mock, as_of("2026-05-21T12:00:00+00:00"))
    await _setup(hass)

    a = _state(hass, "sensor", "game").attributes
    assert _state(hass, "sensor", "game").state == "PRE"
    assert (a["round_name"], a["opponent_abbr"], a["neutral_site"]) == ("Final Four · Semifinal", "ULK", True)
    assert (a["team_seed"], a["opponent_seed"]) == (1, 4)

    calendar = _state(hass, "calendar", "games")
    assert calendar.attributes["message"] == "Olympiacos vs Fenerbahce"
    assert calendar.attributes["location"] == "Telekom Center Athens"
    response = await hass.services.async_call(
        "calendar",
        "get_events",
        {"start_date_time": "2026-04-01T00:00:00+00:00", "end_date_time": "2026-06-01T00:00:00+00:00"},
        target={"entity_id": calendar.entity_id},
        blocking=True,
        return_response=True,
    )
    events = response[calendar.entity_id]["events"]
    assert len(events) == 5
    assert events[2]["description"] == "EuroLeague · Playoffs · Game 3\nW 105-82 @ MCO"
