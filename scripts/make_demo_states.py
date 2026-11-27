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


pre = game_state("PRE", 150, datetime(2026, 11, 27, 15, tzinfo=UTC))
live = game_state(
    "IN",
    140,
    datetime(2026, 11, 25, 19, 5, tzinfo=UTC),
    live=True,
    header=load("header_140_live.json"),
    pbp=load("pbp_140_live.json"),
    shots=None,
)
final = game_state(
    "POST",
    140,
    datetime(2026, 11, 26, 8, tzinfo=UTC),
    header=load("header_140_final.json"),
    box=load("boxscore_140.json"),
    pbp=load("pbp_140_final.json"),
    shots=load("points_140.json"),
)

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
        "friendly_name": "Olympiacos Season stats",
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
        },
        indent=1,
        default=str,
    )
)
print(f"wrote {OUT}")
