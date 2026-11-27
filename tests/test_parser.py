"""Tests for the pure parsing layer, using real-data fixtures."""

from __future__ import annotations

import copy
from datetime import UTC, datetime

from custom_components.euroleague_tracker import parser
from custom_components.euroleague_tracker.const import STATE_IN, STATE_POST, STATE_PRE

from .conftest import load

UTC = UTC


def _oly_games(live=False):
    games = copy.deepcopy(load("games.json")["data"])
    if live:
        for g in games:
            if g["gameCode"] == 140:
                g["played"] = False
    return parser.team_games(games, "OLY")


def _standings():
    return parser.standings_by_code(parser.parse_standings(load("standings_r14.json")))


def test_pretty_name_and_ordinal():
    assert parser.pretty_name("JOSEPH, CORY") == "Cory Joseph"
    assert parser.pretty_name("MILLER-MCINTYRE, CODI") == "Codi Miller-McIntyre"
    assert parser.pretty_name("SHORTS, TJ") == "TJ Shorts"
    assert parser.pretty_name("DE COLO, NANDO") == "Nando De Colo"
    assert [parser.ordinal(n) for n in (1, 2, 3, 4, 11, 12, 13, 21, 22)] == [
        "1st",
        "2nd",
        "3rd",
        "4th",
        "11th",
        "12th",
        "13th",
        "21st",
        "22nd",
    ]


def test_standings_parse():
    rows = parser.parse_standings(load("standings_r14.json"))
    assert len(rows) == 20
    oly = rows[0]
    assert (oly["code"], oly["wins"], oly["losses"], oly["point_diff"]) == ("OLY", 11, 3, 116)
    # API order is oldest -> newest: R10 loss to Zvezda, then four wins.
    assert oly["last5"] == ["L", "W", "W", "W", "W"]
    assert oly["zone"] == "playoffs"
    by_pos = {r["position"]: r for r in rows}
    assert by_pos[6]["zone"] == "playoffs"
    assert by_pos[7]["zone"] == "play_in"
    assert by_pos[10]["zone"] == "play_in"
    assert by_pos[11]["zone"] is None
    assert by_pos[20]["code"] == "BAS"
    assert by_pos[11]["point_diff"] == -20


def test_current_round():
    rounds = load("rounds.json")["data"]
    assert parser.current_round(rounds, datetime(2026, 11, 27, 15, tzinfo=UTC)) == 14
    assert parser.current_round(rounds, datetime(2026, 12, 2, tzinfo=UTC)) == 15


def test_select_game_post_then_pre():
    games = _oly_games()
    # Two days after R14 (hold window 24h): the next game wins.
    game, mode = parser.select_game(games, datetime(2026, 11, 27, 15, tzinfo=UTC), 24)
    assert (game["gameCode"], mode) == (150, "pre")
    # The morning after R14: still showing the final.
    game, mode = parser.select_game(games, datetime(2026, 11, 26, 8, tzinfo=UTC), 24)
    assert (game["gameCode"], mode) == (140, "post")


def test_select_game_live_window():
    games = _oly_games(live=True)
    game, mode = parser.select_game(games, datetime(2026, 11, 25, 19, 5, tzinfo=UTC), 24)
    assert (game["gameCode"], mode) == (140, "check_live")


def test_live_state():
    start = datetime(2026, 11, 25, 18, 15, tzinfo=UTC)
    now = datetime(2026, 11, 25, 19, 5, tzinfo=UTC)
    assert parser.live_state(load("header_140_live.json"), start, now) == STATE_IN
    assert parser.live_state(load("header_140_final.json"), start, now) == STATE_POST
    assert parser.live_state(load("header_150_pre.json"), start, now) == STATE_PRE


def test_final_game_attributes():
    games = _oly_games()
    game = next(g for g in games if g["gameCode"] == 140)
    attrs = parser.build_game_attributes(
        game=game,
        state=STATE_POST,
        team_code="OLY",
        competition_name="EuroLeague",
        season_code="E2026",
        now=datetime(2026, 11, 26, 8, tzinfo=UTC),
        header=load("header_140_final.json"),
        box=load("boxscore_140.json"),
        pbp=load("pbp_140_final.json"),
        standings=_standings(),
    )
    assert attrs["team_score"] == 104 and attrs["opponent_score"] == 79
    assert attrs["team_winner"] is True and attrs["opponent_winner"] is False
    assert attrs["clock"] == "Final"
    assert attrs["quarter_scores"] == {"team": [32, 17, 23, 32], "opponent": [29, 15, 22, 13]}
    assert attrs["attendance"] == 6337
    assert attrs["team_fouls"] == 18 and attrs["opponent_timeouts"] == 5
    top = attrs["top_players"]["team"][0]
    assert (top["name"], top["points"], top["pir"]) == ("Cory Joseph", 27, 31)
    assert attrs["game_stats"]["team"]["fg3"] == "12/30"
    assert attrs["game_stats"]["team"]["fg2_pct"] == 65.0
    assert attrs["game_stats"]["opponent"]["turnovers"] == 20
    assert attrs["play_by_play"][0]["text"] == "End Game"
    assert attrs["coach"]["team"] == "Georgios Bartzokas"
    # teamtracker-compatible basics
    assert attrs["team_homeaway"] == "home" and attrs["opponent_abbr"] == "HTA"
    assert attrs["team_record"] == "11-3"


def test_live_game_attributes():
    games = _oly_games(live=True)
    game = next(g for g in games if g["gameCode"] == 140)
    attrs = parser.build_game_attributes(
        game=game,
        state=STATE_IN,
        team_code="OLY",
        competition_name="EuroLeague",
        season_code="E2026",
        now=datetime(2026, 11, 25, 19, 5, tzinfo=UTC),
        header=load("header_140_live.json"),
        box=None,
        pbp=load("pbp_140_live.json"),
        standings=_standings(),
    )
    assert (attrs["team_score"], attrs["opponent_score"]) == (63, 58)
    assert attrs["quarter"] == 3
    assert attrs["clock"] == "Q3 04:21"
    assert attrs["last_play"] == "Sasha Vezenkov: Two Pointer (11 pt)"
    assert attrs["play_by_play"][0]["scoring"] is True
    assert attrs["play_by_play"][0]["is_team"] is True
    assert attrs["team_fouls"] is None  # blank in the feed -> None, not 0
    # Q1 32-29, Q2 17-15, Q3 in progress 14-14, no Q4 yet.
    assert attrs["quarter_scores"] == {"team": [32, 17, 14], "opponent": [29, 15, 14]}
    assert attrs["top_players"] is None


def test_header_quarters_with_overtime():
    header = {
        "CodeTeamA": "OLY",
        "ScoreA": "98",
        "ScoreB": "95",
        "ScoreQuarter1A": 20,
        "ScoreQuarter2A": 40,
        "ScoreQuarter3A": 60,
        "ScoreQuarter4A": 85,
        "ScoreQuarter1B": 22,
        "ScoreQuarter2B": 41,
        "ScoreQuarter3B": 63,
        "ScoreQuarter4B": 85,
        "ScoreExtraTimeA": 0,
        "ScoreExtraTimeB": 0,
    }
    q = parser._quarters_from_header(header, True)
    assert q == {"team": [20, 20, 20, 25, 13], "opponent": [22, 19, 22, 22, 10]}


def test_away_perspective():
    """Following Hapoel: same game, sides flipped."""
    games = parser.team_games(load("games.json")["data"], "HTA")
    game = next(g for g in games if g["gameCode"] == 140)
    attrs = parser.build_game_attributes(
        game=game,
        state=STATE_POST,
        team_code="HTA",
        competition_name="EuroLeague",
        season_code="E2026",
        now=datetime(2026, 11, 26, 8, tzinfo=UTC),
        header=load("header_140_final.json"),
        box=load("boxscore_140.json"),
        pbp=None,
        standings=_standings(),
    )
    assert (attrs["team_score"], attrs["opponent_score"]) == (79, 104)
    assert attrs["team_homeaway"] == "away"
    assert attrs["team_winner"] is False
    assert attrs["quarter_scores"]["team"] == [29, 15, 22, 13]
    assert attrs["top_players"]["team"][0]["name"] == "Antonio Blakeney"
    assert attrs["team_fouls"] == 20


def test_pre_game_attributes():
    games = _oly_games()
    game = next(g for g in games if g["gameCode"] == 150)
    attrs = parser.build_game_attributes(
        game=game,
        state=STATE_PRE,
        team_code="OLY",
        competition_name="EuroLeague",
        season_code="E2026",
        now=datetime(2026, 11, 27, 15, tzinfo=UTC),
        standings=_standings(),
    )
    assert attrs["opponent_name"] == "LDLC ASVEL"
    assert attrs["kickoff_in"] == "in 7 days"
    assert attrs["date"] == "2026-12-04T19:15:00+00:00"
    assert (attrs["team_record"], attrs["opponent_record"]) == ("11-3", "4-10")
    assert (attrs["team_position"], attrs["opponent_position"]) == (1, 19)
    assert attrs["opponent_form"] == ["L"] * 5
    assert attrs["team_score"] is None and attrs["clock"] is None
    assert attrs["capacity"] == 8300


def test_team_stats_and_leaders():
    stats = parser.parse_team_stats(load("team_stats_oly.json")[0])
    assert stats["points"] == 90.4
    assert (stats["fg2_pct"], stats["fg3_pct"], stats["ft_pct"]) == (60.2, 34.0, 76.6)
    leaders = parser.parse_leaders(load("leaders.json"), "OLY")
    ranks = {(r["category"], r["name"]): r["rank"] for r in leaders["team"]}
    assert ranks[("pir", "Sasha Vezenkov")] == 1
    assert ranks[("points", "Sasha Vezenkov")] == 2
    assert ranks[("assists", "Codi Miller-McIntyre")] == 4
    assert leaders["league"]["points"][0]["name"] == "Nadir Hifi"


def test_shots_match_box_score():
    shots = parser.parse_shots(load("points_140.json"), "OLY")["team"]
    assert len(shots) == 70  # free throws excluded
    twos = [s for s in shots if s[3] == 2]
    threes = [s for s in shots if s[3] == 3]
    # Same as the box score: 26/40 twos, 12/30 threes.
    assert (sum(s[2] for s in twos), len(twos)) == (26, 40)
    assert (sum(s[2] for s in threes), len(threes)) == (12, 30)


def test_summarize_game():
    games = _oly_games()
    tel = next(g for g in games if g["gameCode"] == 117)
    summary = parser.summarize_game(tel, "OLY")
    assert summary["homeaway"] == "away"
    assert (summary["team_score"], summary["opponent_score"], summary["won"]) == (97, 95, True)


def test_humanize():
    now = datetime(2026, 11, 27, 15, tzinfo=UTC)
    assert parser.humanize_delta(datetime(2026, 11, 27, 18, tzinfo=UTC), now) == "in 3 hours"
    assert parser.humanize_delta(datetime(2026, 11, 27, 14, tzinfo=UTC), now) == "an hour ago"
    assert parser.humanize_delta(datetime(2026, 11, 27, 15, 30, tzinfo=UTC), now) == "in 30 minutes"
