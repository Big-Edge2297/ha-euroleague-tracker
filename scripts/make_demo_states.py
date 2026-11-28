"""Build demo Home Assistant states from the real-data test fixtures.

Runs the integration's own parser (no Home Assistant needed), so the
screenshots always show exactly what the sensors would produce.

    python3 scripts/make_demo_states.py  ->  scripts/harness/demo-states.json
"""

from __future__ import annotations

from datetime import UTC, datetime
import importlib
import json
from pathlib import Path
import sys
import types

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / "tests" / "fixtures"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "scripts" / "harness" / "demo-states.json"

# Import parser.py/const.py without running the integration's __init__.py
# (which needs Home Assistant).
pkg = types.ModuleType("elt")
pkg.__path__ = [str(ROOT / "custom_components" / "euroleague_tracker")]
sys.modules["elt"] = pkg
parser = importlib.import_module("elt.parser")
const = importlib.import_module("elt.const")

ATTRIBUTION = const.ATTRIBUTION
TEAM = "OLY"


def load(name):
    return json.loads((FIX / name).read_text())


def games(live=False):
    data = load("games.json")["data"]
    if live:
        for g in data:
            if g["gameCode"] == 140:
                g["played"] = False
    return parser.team_games(data, TEAM)


rows = parser.parse_standings(load("standings_r14.json"))
by_code = parser.standings_by_code(rows)
common = {"attribution": ATTRIBUTION, "friendly_name": "Olympiacos Game"}


def game_state(state, game_code, now, **feeds):
    mine = games(live=feeds.pop("live", False))
    game = next(g for g in mine if g["gameCode"] == game_code)
    played = [g for g in mine if g.get("played") and g is not game]
    upcoming = [g for g in mine if not g.get("played") and g is not game and parser.game_start(g) > now]
    attrs = parser.build_game_attributes(
        game=game,
        state=state,
        team_code=TEAM,
        competition_name="EuroLeague",
        season_code="E2026",
        now=now,
        standings=by_code,
        prev_game=parser.summarize_game(played[-1], TEAM) if played else None,
        next_game=parser.summarize_game(upcoming[0], TEAM) if upcoming else None,
        **feeds,
    )
    attrs["team_color"] = const.TEAM_COLORS[TEAM]
    return {"state": state, "attributes": {**common, **attrs}}


past = load("games_E2025.json")["data"] + load("games_E2024.json")["data"]
evolution = load("evolution_140.json")

pre = game_state("PRE", 150, datetime(2026, 11, 27, 15, tzinfo=UTC))
pre["attributes"]["head_to_head"] = parser.head_to_head(past, TEAM, "ASV")
pre["attributes"]["score_flow"] = None
live = game_state(
    "IN",
    140,
    datetime(2026, 11, 25, 19, 5, tzinfo=UTC),
    live=True,
    header=load("header_140_live.json"),
    pbp=load("pbp_140_live.json"),
    shots=None,
)
# Q3 04:21 is minute 25 of 40.
live["attributes"]["score_flow"] = parser.parse_evolution(
    {"PointsList": [side[:26] for side in evolution["PointsList"]]}, True
)
live["attributes"]["head_to_head"] = None
final = game_state(
    "POST",
    140,
    datetime(2026, 11, 26, 8, tzinfo=UTC),
    header=load("header_140_final.json"),
    box=load("boxscore_140.json"),
    pbp=load("pbp_140_final.json"),
    shots=load("points_140.json"),
)

final["attributes"]["score_flow"] = parser.parse_evolution(evolution, True)
final["attributes"]["head_to_head"] = None

me = by_code[TEAM]
standings = {
    "state": str(me["position"]),
    "attributes": {
        "attribution": ATTRIBUTION,
        "team_abbr": TEAM,
        "competition": "EuroLeague",
        "season": "E2026",
        "round": 14,
        "table": rows,
        "scoreboard": parser.round_scoreboard(load("games.json")["data"], [13, 14, 15]),
        "playoff_race": {
            **parser.playoff_race(rows, load("games.json")["data"], TEAM),
            # The fixtures hold a few rounds; the real regular season ends on 18 Apr 2027.
            "last_game_date": "2027-04-18T00:00:00+00:00",
        },
        "bracket": None,
        "friendly_name": "Olympiacos Standings position",
    },
}
leaders = parser.parse_leaders(load("leaders.json"), TEAM)
stats = {
    "state": "90.4",
    "attributes": {
        "attribution": ATTRIBUTION,
        "team_abbr": TEAM,
        "competition": "EuroLeague",
        "season": "E2026",
        "per_game": parser.parse_team_stats(load("team_stats_oly.json")[0]),
        "team_leader_ranks": leaders["team"],
        "league_leaders": leaders["league"],
        "league_ranks": parser.parse_league_ranks(load("team_traditional.json"), TEAM),
        # Real season figures (27 Nov 2026, from all 140 games played so far
        # and the 934 Olympiacos shots); the fixtures only hold a few games.
        "attack_defence": {
            "scored": 90.4,
            "allowed": 81.3,
            "net": 9.1,
            "scored_rank": 4,
            "allowed_rank": 4,
            "league_average": 87.1,
            "teams": 20,
        },
        "form": parser.season_form([g for g in games() if g.get("played")], TEAM),
        "shot_zones": parser.merge_zones(
            [
                {
                    "rim": [171, 209],
                    "paint": [138, 282],
                    "mid_range": [27, 67],
                    "corner_three": [32, 77],
                    "above_break_three": [96, 299],
                }
            ]
        )
        | {"games": 14},
        "friendly_name": "Olympiacos Season stats",
    },
}

# ------------------------------------------------- 2025-26 postseason (real)
post_games = load("games_E2025_postseason.json")["data"]
post_rows = parser.parse_standings(load("standings_E2025_r38.json"))
post_seeds = parser.standings_by_code(post_rows)


def post_state(state, game_code, now, keep_after=False):
    """A postseason game as the sensor showed it at `now` (later games unplayed)."""
    games_now = []
    for g in json.loads(json.dumps(post_games)):
        if parser.game_start(g) > now and not keep_after:
            if parser.phase_code(g) == "FF" and g["gameCode"] != game_code and state == "POST":
                continue
            g["played"] = False
            g["local"]["score"] = g["road"]["score"] = 0
        games_now.append(g)
    mine = parser.drop_unneeded(parser.team_games(games_now, TEAM), TEAM)
    game = next(g for g in mine if g["gameCode"] == game_code)
    played = [g for g in mine if g.get("played") and g is not game]
    upcoming = [g for g in mine if not g.get("played") and g is not game and parser.game_start(g) > now]
    attrs = parser.build_game_attributes(
        game=game,
        state=state,
        team_code=TEAM,
        competition_name="EuroLeague",
        season_code="E2025",
        now=now,
        standings=post_seeds,
        prev_game=parser.summarize_game(played[-1], TEAM) if played else None,
        next_game=parser.summarize_game(upcoming[0], TEAM) if upcoming else None,
    )
    attrs.update(parser.postseason_attributes(game, mine, TEAM, post_seeds))
    attrs.update(team_color=const.TEAM_COLORS[TEAM], score_flow=None, head_to_head=None)
    return {"state": state, "attributes": {**common, **attrs}}


# Game 3 at Monaco, and the semifinal the day before (both 2025-26).
po_final = post_state("POST", 392, datetime(2026, 5, 5, 21, tzinfo=UTC))
ff_pre = post_state("PRE", 406, datetime(2026, 5, 22, 20, tzinfo=UTC))
standings_post = {
    "state": "1",
    "attributes": {
        "attribution": ATTRIBUTION,
        "team_abbr": TEAM,
        "competition": "EuroLeague",
        "season": "E2025",
        "round": 38,
        "table": post_rows,
        "scoreboard": parser.round_scoreboard(post_games, [45, 46, 47]),
        "playoff_race": None,
        "bracket": parser.parse_bracket(post_games, post_rows),
        "friendly_name": "Olympiacos Standings position",
    },
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    json.dumps(
        {
            "pre": pre,
            "live": live,
            "final": final,
            "standings": standings,
            "stats": stats,
            "po_final": po_final,
            "ff_pre": ff_pre,
            "standings_post": standings_post,
        },
        indent=1,
        default=str,
    )
)
print(f"wrote {OUT}")
