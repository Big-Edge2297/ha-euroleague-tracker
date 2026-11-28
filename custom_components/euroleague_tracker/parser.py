"""Pure functions that turn EuroLeague API payloads into sensor data.

Nothing in here talks to the network or to Home Assistant, which keeps the
logic easy to test against recorded API responses.

API quirks handled here (all observed on the live API, Nov 2026):
- Live-feed team codes are padded with spaces ("OLY       ").
- The play-by-play key for the 4th quarter is spelled "ForthQuarter".
- `last5Form` in standings runs oldest -> newest.
- Standings points (`standingsScore`) exclude overtime points, so they can
  differ from real points scored (`score`).
- Header `ScoreQuarterNA` values are cumulative; Boxscore `ByQuarter` is not.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from .const import (
    PLAY_IN_SPOTS,
    PLAYOFF_SPOTS,
    SHORT_NAMES,
    STATE_IN,
    STATE_NOT_FOUND,
    STATE_POST,
    STATE_PRE,
    TEAM_COLORS,
)

GAME_LENGTH = timedelta(hours=2, minutes=15)
LIVE_CHECK_WINDOW = timedelta(hours=12)
PREFER_NEXT_WITHIN = timedelta(hours=6)

PBP_QUARTER_KEYS = (
    ("FirstQuarter", 1),
    ("SecondQuarter", 2),
    ("ThirdQuarter", 3),
    ("ForthQuarter", 4),
    ("FourthQuarter", 4),
    ("ExtraTime", 5),
)

# Play types worth showing in a ticker (made shots, misses, key events).
PBP_INTERESTING = {
    "2FGM",
    "3FGM",
    "FTM",
    "2FGA",
    "3FGA",
    "FTA",
    "TO",
    "ST",
    "FV",
    "AS",
    "D",
    "O",
    "CM",
    "CMU",
    "CMT",
    "TOUT",
    "TOUT_TV",
    "BP",
    "EP",
    "EG",
}
PBP_SCORING = {"2FGM", "3FGM", "FTM"}


# --------------------------------------------------------------------- utils


def short_name(club: dict[str, Any] | None) -> str:
    """The club's everyday name: 'LDLC ASVEL' -> 'ASVEL' (sponsor words dropped)."""
    club = club or {}
    code = clean_code(club.get("code"))
    return SHORT_NAMES.get(code) or club.get("abbreviatedName") or club.get("name") or code


def clean_code(value: Any) -> str:
    return str(value or "").strip().upper()


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def to_int(value: Any) -> int | None:
    """'104' -> 104, '+116' -> 116, 336.0 -> 336, '' / None -> None."""
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        try:
            return int(float(str(value).strip()))
        except (TypeError, ValueError):
            return None


def pretty_name(raw: str | None) -> str:
    """'JOSEPH, CORY' -> 'Cory Joseph'."""
    if not raw:
        return ""
    if "," in raw:
        last, first = [p.strip() for p in raw.split(",", 1)]
        raw = f"{first} {last}"
    words = []
    tokens = raw.split()
    for i, word in enumerate(tokens):
        if word.isupper():
            if i == 0 and len(tokens) > 1 and len(word) <= 2 and word.isalpha():
                words.append(word)  # initials such as "TJ", "CJ"
                continue
            parts = []
            for part in word.split("-"):
                part = part.capitalize()
                if part.startswith("Mc") and len(part) > 2:
                    part = "Mc" + part[2:].capitalize()
                parts.append(part)
            word = "-".join(parts)
        words.append(word)
    return " ".join(words)


def ordinal(n: int | None) -> str | None:
    if n is None:
        return None
    suffix = "th" if 11 <= n % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def humanize_delta(target: datetime, now: datetime) -> str:
    """'in 7 days', 'in 3 hours', '2 hours ago' (like teamtracker's kickoff_in)."""
    delta = target - now
    future = delta.total_seconds() >= 0
    secs = abs(delta.total_seconds())
    if secs < 90:
        text = "a minute"
    elif secs < 3600:
        text = f"{round(secs / 60)} minutes"
    elif secs < 86400 * 1.5:
        hours = round(secs / 3600)
        text = "an hour" if hours == 1 else f"{hours} hours"
    else:
        days = round(secs / 86400)
        text = "a day" if days == 1 else f"{days} days"
    return f"in {text}" if future else f"{text} ago"


def team_color(code: str) -> str | None:
    return TEAM_COLORS.get(clean_code(code))


# ------------------------------------------------------------- game choice


def club_of(side: dict[str, Any] | None) -> dict[str, Any]:
    return (side or {}).get("club") or {}


def team_games(games: list[dict[str, Any]], code: str) -> list[dict[str, Any]]:
    code = clean_code(code)
    mine = [
        g
        for g in games
        if clean_code(club_of(g.get("local")).get("code")) == code
        or clean_code(club_of(g.get("road")).get("code")) == code
    ]
    return sorted(mine, key=lambda g: g.get("utcDate") or g.get("date") or "")


def game_start(game: dict[str, Any]) -> datetime | None:
    return parse_dt(game.get("utcDate")) or parse_dt(game.get("date"))


def select_game(
    games: list[dict[str, Any]], now: datetime, post_game_hours: float
) -> tuple[dict[str, Any] | None, str]:
    """Pick the game to show, and how to treat it.

    Returns (game, mode) where mode is "check_live" (may be in progress: ask
    the live feed), "pre", "post" or "none".
    """
    if not games:
        return None, "none"

    played = [g for g in games if g.get("played")]
    unplayed = [g for g in games if not g.get("played")]

    for game in unplayed:
        start = game_start(game)
        if start and start <= now <= start + LIVE_CHECK_WINDOW:
            return game, "check_live"

    upcoming = [g for g in unplayed if (game_start(g) or now) > now]
    nxt = upcoming[0] if upcoming else None
    last = played[-1] if played else None

    if last:
        last_end = (game_start(last) or now) + GAME_LENGTH
        within_hold = now - last_end <= timedelta(hours=post_game_hours)
        next_close = nxt is not None and (game_start(nxt) or now) - now <= PREFER_NEXT_WITHIN
        if (within_hold and not next_close) or nxt is None:
            return last, "post"
    if nxt:
        return nxt, "pre"
    return None, "none"


def live_state(header: dict[str, Any], start: datetime | None, now: datetime) -> str:
    """Decide PRE / IN / POST for a game that may be in progress."""
    if header.get("Live") is True:
        return STATE_IN
    score_a = to_int(header.get("ScoreA")) or 0
    score_b = to_int(header.get("ScoreB")) or 0
    if score_a + score_b > 0 and (start is None or now >= start):
        return STATE_POST
    return STATE_PRE


# --------------------------------------------------------------- standings


def parse_standings(payload: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for team in payload.get("teams", []) or []:
        club = team.get("club") or {}
        pos = to_int(team.get("position"))
        zone = None
        if pos is not None:
            zone = "playoffs" if pos <= PLAYOFF_SPOTS else "play_in" if pos <= PLAY_IN_SPOTS else None
        rows.append(
            {
                "position": pos,
                "position_change": (team.get("positionChange") or "").lower() or None,
                "code": clean_code(club.get("code")),
                "name": short_name(club),
                "full_name": club.get("name"),
                "crest": (club.get("images") or {}).get("crest"),
                "played": to_int(team.get("gamesPlayed")),
                "wins": to_int(team.get("gamesWon")),
                "losses": to_int(team.get("gamesLost")),
                "win_pct": team.get("winPercentage"),
                "points_for": to_int(team.get("pointsFor")),
                "points_against": to_int(team.get("pointsAgainst")),
                "point_diff": to_int(team.get("pointsDifference")),
                "home_record": team.get("homeRecord"),
                "away_record": team.get("awayRecord"),
                "last10": team.get("lastTenRecord"),
                # API order is oldest -> newest; keep it and say so.
                "last5": list(team.get("last5Form") or []),
                "zone": zone,
            }
        )
    rows.sort(key=lambda r: r["position"] or 99)
    return rows


def standings_by_code(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {r["code"]: r for r in rows}


def current_round(rounds: list[dict[str, Any]], now: datetime) -> int | None:
    """Latest regular-season round that has started (for standings).

    The table stops at the last regular-season round, so during the play-in,
    playoffs and Final Four it shows the final table (the seeds).
    """
    started = [
        r
        for r in rounds
        if (parse_dt(r.get("minGameStartDate")) or now + timedelta(1)) <= now
        and (r.get("phaseTypeCode") or "RS") == "RS"
    ]
    if not started:
        return None
    return max(to_int(r.get("round")) or 0 for r in started) or None


# ---------------------------------------------------------------- box score


def _side_index(names_or_codes: list[str], team_code: str, team_names: tuple[str, ...]) -> int:
    for i, value in enumerate(names_or_codes):
        v = str(value or "").strip().upper()
        if v == team_code or v in team_names:
            return i
    return 0


def parse_boxscore(box: dict[str, Any], team_code: str, team_names: tuple[str, ...]) -> dict:
    """Quarter scores, top players and team totals, split into team/opponent."""
    if not box:
        return {}
    stats = box.get("Stats") or []
    by_quarter = box.get("ByQuarter") or []

    def idx(items, key):
        return _side_index([it.get(key) for it in items], team_code, team_names)

    out: dict[str, Any] = {}
    if len(by_quarter) == 2:
        t = idx(by_quarter, "Team")
        o = 1 - t
        quarters = {}
        for side, i in (("team", t), ("opponent", o)):
            row = by_quarter[i]
            values = [to_int(row.get(f"Quarter{q}")) for q in range(1, 5)]
            extra = [to_int(v) for k, v in sorted(row.items()) if k.startswith("Extra") and v]
            quarters[side] = [v for v in values if v is not None] + extra
        out["quarter_scores"] = quarters

    if len(stats) == 2:
        # Match the side by any player's team code (most reliable).
        t = 0
        for i, s in enumerate(stats):
            players = s.get("PlayersStats") or []
            if players and clean_code(players[0].get("Team")) == team_code:
                t = i
                break
        else:
            t = idx(stats, "Team")
        o = 1 - t
        for side, i in (("team", t), ("opponent", o)):
            block = stats[i]
            players = [p for p in block.get("PlayersStats") or [] if p.get("Minutes") not in (None, "DNP")]
            top = sorted(players, key=lambda p: to_int(p.get("Valuation")) or 0, reverse=True)[:5]
            out.setdefault("top_players", {})[side] = [
                {
                    "name": pretty_name(p.get("Player")),
                    "number": str(p.get("Dorsal") or "").strip(),
                    "minutes": p.get("Minutes"),
                    "points": to_int(p.get("Points")),
                    "rebounds": to_int(p.get("TotalRebounds")),
                    "assists": to_int(p.get("Assistances")),
                    "pir": to_int(p.get("Valuation")),
                }
                for p in top
            ]
            tot = block.get("totr") or {}
            out.setdefault("game_stats", {})[side] = _team_totals(tot)
            out.setdefault("coach", {})[side] = pretty_name(block.get("Coach"))
    return out


def to_float(value: Any) -> float | None:
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def _pct(made: Any, att: Any) -> float | None:
    m, a = to_float(made), to_float(att)
    if not a:
        return None
    return round(100 * (m or 0) / a, 1)


def _team_totals(tot: dict[str, Any]) -> dict[str, Any]:
    if not tot:
        return {}
    return {
        "points": to_int(tot.get("Points")),
        "fg2": f"{to_int(tot.get('FieldGoalsMade2'))}/{to_int(tot.get('FieldGoalsAttempted2'))}",
        "fg2_pct": _pct(tot.get("FieldGoalsMade2"), tot.get("FieldGoalsAttempted2")),
        "fg3": f"{to_int(tot.get('FieldGoalsMade3'))}/{to_int(tot.get('FieldGoalsAttempted3'))}",
        "fg3_pct": _pct(tot.get("FieldGoalsMade3"), tot.get("FieldGoalsAttempted3")),
        "ft": f"{to_int(tot.get('FreeThrowsMade'))}/{to_int(tot.get('FreeThrowsAttempted'))}",
        "ft_pct": _pct(tot.get("FreeThrowsMade"), tot.get("FreeThrowsAttempted")),
        "rebounds": to_int(tot.get("TotalRebounds")),
        "assists": to_int(tot.get("Assistances")),
        "steals": to_int(tot.get("Steals")),
        "turnovers": to_int(tot.get("Turnovers")),
        "blocks": to_int(tot.get("BlocksFavour")),
        "fouls": to_int(tot.get("FoulsCommited")),
        "pir": to_int(tot.get("Valuation")),
    }


# ------------------------------------------------------------- play by play


def parse_play_by_play(pbp: dict[str, Any], team_code: str, limit: int = 8) -> dict[str, Any]:
    if not pbp:
        return {}
    plays: list[dict[str, Any]] = []
    for quarter, row in _pbp_rows(pbp):
        ptype = (row.get("PLAYTYPE") or "").strip()
        if ptype not in PBP_INTERESTING:
            continue
        code = clean_code(row.get("CODETEAM"))
        text = _play_text(row)
        if not text:
            continue
        score = None
        if row.get("POINTS_A") is not None:
            score = f"{row.get('POINTS_A')}-{row.get('POINTS_B')}"
        plays.append(
            {
                "quarter": quarter,
                "clock": (row.get("MARKERTIME") or "").strip() or None,
                "team": code or None,
                "is_team": code == team_code if code else None,
                "type": ptype,
                "scoring": ptype in PBP_SCORING,
                "text": text,
                "score": score,
            }
        )
    plays.reverse()  # newest first
    return {
        "quarter": to_int(pbp.get("ActualQuarter")),
        "plays": plays[:limit],
        "last_play": plays[0]["text"] if plays else None,
    }


SCORING_POINTS = {"FTM": 1, "2FGM": 2, "3FGM": 3}
SCORING_KIND = {"FTM": "free_throw", "2FGM": "two_pointer", "3FGM": "three_pointer"}


def _pbp_rows(pbp: dict[str, Any]):
    """(quarter, row) for every play, oldest first; ForthQuarter/FourthQuarter read once."""
    fourth_done = False
    for key, quarter in PBP_QUARTER_KEYS:
        rows = pbp.get(key) or []
        if quarter == 4:
            if fourth_done or not rows:
                continue
            fourth_done = True
        for row in rows:
            yield quarter, row


def scoring_plays(pbp: dict[str, Any], team_code: str) -> list[dict[str, Any]]:
    """Every made basket in the play-by-play, oldest first.

    `seq` is the feed's play number, which only grows during a game, so the
    coordinator can tell which baskets are new since its last update.
    """
    if not pbp:
        return []
    team_code = clean_code(team_code)
    team_is_a = clean_code(pbp.get("CodeTeamA")) == team_code
    plays = []
    for quarter, row in _pbp_rows(pbp):
        ptype = (row.get("PLAYTYPE") or "").strip()
        if ptype not in SCORING_POINTS:
            continue
        seq = to_int(row.get("NUMBEROFPLAY"))
        if seq is None:
            continue
        a, b = to_int(row.get("POINTS_A")), to_int(row.get("POINTS_B"))
        plays.append(
            {
                "seq": seq,
                "quarter": quarter,
                "clock": (row.get("MARKERTIME") or "").strip() or None,
                "side": "team" if clean_code(row.get("CODETEAM")) == team_code else "opponent",
                "type": SCORING_KIND[ptype],
                "points": SCORING_POINTS[ptype],
                "player": pretty_name(row.get("PLAYER")) or None,
                "team_score": a if team_is_a else b,
                "opponent_score": b if team_is_a else a,
            }
        )
    plays.sort(key=lambda p: (p["quarter"], p["seq"]))
    return plays


# ------------------------------------------------------------ team summary


def streak(played_games: list[dict[str, Any]], team_code: str) -> str | None:
    """'W4' / 'L2' from the run of results ending with the latest game."""
    results = [summarize_game(g, team_code).get("won") for g in played_games if g.get("played")]
    results = [r for r in results if r is not None]
    if not results:
        return None
    last = results[-1]
    count = 0
    for result in reversed(results):
        if result != last:
            break
        count += 1
    return f"{'W' if last else 'L'}{count}"


def games_behind(rows: list[dict[str, Any]], team_code: str, spot: int) -> float | None:
    """Games behind the team in `spot` (0 when at or above it)."""
    me = next((r for r in rows if r["code"] == clean_code(team_code)), None)
    target = next((r for r in rows if r["position"] == spot), None)
    if not me or not target or me["position"] is None:
        return None
    if me["position"] <= spot:
        return 0.0
    gap = ((target["wins"] - me["wins"]) + (me["losses"] - target["losses"])) / 2
    return max(gap, 0.0)


def result_text(summary: dict[str, Any] | None) -> str | None:
    """'W 104-79 vs HTA' / 'W 97-95 @ TEL' from summarize_game()."""
    if not summary or summary.get("team_score") is None:
        return None
    where = "vs" if summary["homeaway"] == "home" else "@"
    letter = "W" if summary.get("won") else "L"
    return f"{letter} {summary['team_score']}-{summary['opponent_score']} {where} {summary['opponent_abbr']}"


def _play_text(row: dict[str, Any]) -> str | None:
    info = (row.get("PLAYINFO") or "").strip()
    player = pretty_name(row.get("PLAYER"))
    ptype = (row.get("PLAYTYPE") or "").strip()
    if ptype in ("BP", "EP", "EG"):
        return info or None
    if ptype == "TOUT_TV":
        return "TV timeout"
    if ptype == "TOUT":
        return f"Timeout {pretty_name(row.get('TEAM')) or ''}".strip()
    # "Two Pointer (4/5 -  11 pt)" -> "Two Pointer (11 pt)"
    if "(" in info and "pt)" in info:
        base = info.split("(")[0].strip()
        pts = info.split("-")[-1].replace(")", "").strip()
        info = f"{base} ({' '.join(pts.split())})"
    elif "(" in info:
        info = info.split("(")[0].strip()
    if player and info:
        return f"{player}: {info}"
    return info or player or None


# -------------------------------------------------------------------- shots


def parse_shots(points: dict[str, Any], team_code: str) -> dict[str, Any] | None:
    """Field-goal attempts for both sides as compact [x, y, made, value] rows.

    Coordinates are in centimetres with the basket at (0, 0); y grows away
    from the baseline. Free throws are left out.
    """
    rows = (points or {}).get("Rows") or []
    if not rows:
        return None
    out: dict[str, list] = {"team": [], "opponent": []}
    for row in rows:
        action = (row.get("ID_ACTION") or "").strip()
        if action not in ("2FGM", "2FGA", "3FGM", "3FGA"):
            continue
        x, y = to_int(row.get("COORD_X")), to_int(row.get("COORD_Y"))
        if x is None or y is None:
            continue
        side = "team" if clean_code(row.get("TEAM")) == team_code else "opponent"
        out[side].append([x, y, 1 if action.endswith("M") else 0, int(action[0])])
    return out


# ------------------------------------------------------------- season stats


def parse_team_stats(payload: dict[str, Any]) -> dict[str, Any]:
    avg = payload.get("averagePerGame") or {}
    acc = payload.get("accumulated") or {}
    if not avg:
        return {}

    def r(v):
        return round(v, 1) if isinstance(v, (int, float)) else None

    return {
        "games_played": to_int(avg.get("gamesPlayed")),
        "points": r(avg.get("points")),
        "rebounds": r(avg.get("totalRebounds")),
        "offensive_rebounds": r(avg.get("offensiveRebounds")),
        "defensive_rebounds": r(avg.get("defensiveRebounds")),
        "assists": r(avg.get("assistances")),
        "steals": r(avg.get("steals")),
        "turnovers": r(avg.get("turnovers")),
        "blocks": r(avg.get("blocksFavour")),
        "fouls": r(avg.get("foulsCommited")),
        "pir": r(avg.get("valuation")),
        "fg2_pct": _pct(acc.get("fieldGoalsMade2"), acc.get("fieldGoalsAttempted2")),
        "fg3_pct": _pct(acc.get("fieldGoalsMade3"), acc.get("fieldGoalsAttempted3")),
        "ft_pct": _pct(acc.get("freeThrowsMade"), acc.get("freeThrowsAttempted")),
        "total_points": to_int(acc.get("points")),
    }


LEADER_CATEGORIES = ("points", "rebounds", "assists", "pir", "steals", "blocks")


def parse_leaders(payload: dict[str, Any], team_code: str, top: int = 5) -> dict[str, Any]:
    """League top-N per category plus every ranking of the team's players."""
    league: dict[str, list] = {}
    team: list[dict[str, Any]] = []
    for cat in LEADER_CATEGORIES:
        rows = payload.get(cat) or []
        league[cat] = [_leader_row(r) for r in rows[:top]]
        for row in rows:
            details = row.get("details") or {}
            if clean_code((details.get("team") or {}).get("code")) == team_code:
                rank = to_int(row.get("rank"))
                if rank is not None and rank <= 20:
                    team.append({**_leader_row(row), "category": cat})
    team.sort(key=lambda r: (r["rank"], LEADER_CATEGORIES.index(r["category"])))
    return {"league": league, "team": team}


def _leader_row(row: dict[str, Any]) -> dict[str, Any]:
    details = row.get("details") or {}
    avg = row.get("average")
    return {
        "rank": to_int(row.get("rank")),
        "name": pretty_name(details.get("name")),
        "team": clean_code((details.get("team") or {}).get("code")),
        "value": round(avg, 1) if isinstance(avg, (int, float)) else None,
        "games": to_int(row.get("gamesPlayed")),
        "image": details.get("imageUrl"),
    }


# -------------------------------------------------------- game attributes


def summarize_game(game: dict[str, Any], team_code: str) -> dict[str, Any]:
    """Small dict describing a game from the team's point of view."""
    home = clean_code(club_of(game.get("local")).get("code")) == team_code
    us, them = (game.get("local"), game.get("road")) if home else (game.get("road"), game.get("local"))
    start = game_start(game)
    out = {
        "game_code": game.get("gameCode"),
        "round": game.get("round"),
        "date": start.isoformat() if start else None,
        "homeaway": "home" if home else "away",
        "opponent_abbr": clean_code(club_of(them).get("code")),
        "opponent_name": short_name(club_of(them)),
        "opponent_logo": (club_of(them).get("images") or {}).get("crest"),
        "venue": (game.get("venue") or {}).get("name"),
    }
    if game.get("played"):
        ts, os_ = to_int((us or {}).get("score")), to_int((them or {}).get("score"))
        out.update({"team_score": ts, "opponent_score": os_, "won": (ts or 0) > (os_ or 0)})
    return out


def build_game_attributes(
    *,
    game: dict[str, Any] | None,
    state: str,
    team_code: str,
    competition_name: str,
    season_code: str,
    now: datetime,
    header: dict[str, Any] | None = None,
    box: dict[str, Any] | None = None,
    pbp: dict[str, Any] | None = None,
    standings: dict[str, dict[str, Any]] | None = None,
    prev_game: dict[str, Any] | None = None,
    next_game: dict[str, Any] | None = None,
    shots: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Attributes compatible with ha-teamtracker, plus EuroLeague extras."""
    standings = standings or {}
    attrs: dict[str, Any] = {
        "sport": "basketball",
        "league": competition_name.upper(),
        "league_logo": None,
        "season": season_code,
        "api_message": None,
        "last_update": now.isoformat(),
    }
    if not game or state == STATE_NOT_FOUND:
        attrs["api_message"] = "No game found for this team in the current season"
        return attrs

    local, road = game.get("local") or {}, game.get("road") or {}
    is_home = clean_code(club_of(local).get("code")) == team_code
    us, them = (local, road) if is_home else (road, local)
    us_club, them_club = club_of(us), club_of(them)
    us_code, them_code = clean_code(us_club.get("code")), clean_code(them_club.get("code"))
    start = game_start(game)
    venue = game.get("venue") or {}

    def record(code):
        row = standings.get(code)
        return f"{row['wins']}-{row['losses']}" if row else None

    attrs.update(
        {
            "event_name": f"{short_name(club_of(road))} @ {short_name(club_of(local))}",
            "date": start.isoformat() if start else None,
            "kickoff_in": humanize_delta(start, now) if start else None,
            "venue": venue.get("name"),
            "location": venue.get("address"),
            "tv_network": None,
            "odds": None,
            "overunder": None,
            "team_abbr": us_code,
            "team_id": us_code,
            "team_name": short_name(us_club),
            "team_long_name": us_club.get("name"),
            "team_record": record(us_code),
            "team_rank": None,
            "team_position": (standings.get(us_code) or {}).get("position"),
            "team_homeaway": "home" if is_home else "away",
            "team_logo": (us_club.get("images") or {}).get("crest"),
            "team_colors": [team_color(us_code) or "#444444", "#FFFFFF"],
            "team_form": (standings.get(us_code) or {}).get("last5"),
            "team_score": None,
            "team_win_probability": None,
            "team_winner": None,
            "team_timeouts": None,
            "team_fouls": None,
            "opponent_abbr": them_code,
            "opponent_id": them_code,
            "opponent_name": short_name(them_club),
            "opponent_long_name": them_club.get("name"),
            "opponent_record": record(them_code),
            "opponent_rank": None,
            "opponent_position": (standings.get(them_code) or {}).get("position"),
            "opponent_homeaway": "away" if is_home else "home",
            "opponent_logo": (them_club.get("images") or {}).get("crest"),
            "opponent_colors": [team_color(them_code) or "#444444", "#FFFFFF"],
            "opponent_form": (standings.get(them_code) or {}).get("last5"),
            "opponent_score": None,
            "opponent_win_probability": None,
            "opponent_winner": None,
            "opponent_timeouts": None,
            "opponent_fouls": None,
            "quarter": None,
            "clock": None,
            "possession": None,
            "last_play": None,
            "competition": competition_name,
            "round": game.get("round"),
            "round_name": game.get("roundName"),
            "phase": (game.get("phaseType") or {}).get("name"),
            "game_code": game.get("gameCode"),
            "attendance": None,
            "capacity": to_int(venue.get("capacity")),
            "quarter_scores": None,
            "top_players": None,
            "game_stats": None,
            "play_by_play": None,
            "shots": None,
            "coach": None,
            "previous_game": prev_game,
            "next_game": next_game,
        }
    )

    if state == STATE_PRE:
        if prev_game:
            attrs["last_play"] = None
        return attrs

    # Scores: live header first (freshest), then the schedule.
    header = header or {}
    header_home_is_a = clean_code(header.get("CodeTeamA")) == clean_code(club_of(local).get("code"))
    if header:
        a, b = to_int(header.get("ScoreA")), to_int(header.get("ScoreB"))
        home_s, away_s = (a, b) if header_home_is_a else (b, a)
    else:
        home_s, away_s = to_int(local.get("score")), to_int(road.get("score"))
    if home_s is None and game.get("played"):
        home_s, away_s = to_int(local.get("score")), to_int(road.get("score"))
    attrs["team_score"], attrs["opponent_score"] = (home_s, away_s) if is_home else (away_s, home_s)

    a_side_is_us = clean_code(header.get("CodeTeamA")) == us_code if header else True
    if header:
        fa, fb = to_int(header.get("FoultsA")), to_int(header.get("FoultsB"))
        ta, tb = to_int(header.get("TimeoutsA")), to_int(header.get("TimeoutsB"))
        attrs["team_fouls"], attrs["opponent_fouls"] = (fa, fb) if a_side_is_us else (fb, fa)
        attrs["team_timeouts"], attrs["opponent_timeouts"] = (ta, tb) if a_side_is_us else (tb, ta)
        attrs["attendance"] = to_int(header.get("Capacity"))  # the live feed puts attendance here

    team_names = tuple(n.upper() for n in (us_club.get("name"), us_club.get("abbreviatedName")) if n)
    if box:
        parsed = parse_boxscore(box, us_code, team_names)
        attrs.update({k: v for k, v in parsed.items() if v})
        attrs["attendance"] = to_int(box.get("Attendance")) or attrs["attendance"]
    if not attrs.get("quarter_scores") and header:
        attrs["quarter_scores"] = _quarters_from_header(header, a_side_is_us)
    if not attrs.get("quarter_scores") and state == STATE_POST:
        # The schedule's partials are only trusted once the game is over.
        attrs["quarter_scores"] = _quarters_from_schedule(us, them)

    if shots:
        attrs["shots"] = parse_shots(shots, us_code)

    if pbp:
        parsed_pbp = parse_play_by_play(pbp, us_code)
        attrs["play_by_play"] = parsed_pbp.get("plays")
        attrs["last_play"] = parsed_pbp.get("last_play")
        if state == STATE_IN:
            attrs["quarter"] = parsed_pbp.get("quarter")

    if state == STATE_IN:
        q = to_int(header.get("Quarter")) or attrs.get("quarter")
        attrs["quarter"] = q
        clock = (header.get("RemainingPartialTime") or "").strip() or None
        label = "OT" if q and q > 4 else f"Q{q}" if q else ""
        attrs["clock"] = f"{label} {clock}".strip() if clock else label or None
    elif state == STATE_POST:
        ts, os_ = attrs["team_score"] or 0, attrs["opponent_score"] or 0
        attrs["team_winner"] = ts > os_
        attrs["opponent_winner"] = os_ > ts
        quarters = (attrs.get("quarter_scores") or {}).get("team") or []
        attrs["clock"] = "Final/OT" if len(quarters) > 4 else "Final"
        attrs["quarter"] = len(quarters) or 4
    return attrs


def _quarters_from_header(header: dict[str, Any], a_side_is_us: bool) -> dict[str, list] | None:
    """Per-quarter points from the live header's cumulative quarter scores.

    Finished quarters come from the cumulative values; the quarter in play is
    the current score minus the last finished cumulative value.
    """

    def side(letter: str) -> list[int]:
        score = to_int(header.get(f"Score{letter}")) or 0
        cums = [to_int(header.get(f"ScoreQuarter{q}{letter}")) or 0 for q in range(1, 5)]
        extra = to_int(header.get(f"ScoreExtraTime{letter}")) or 0
        out, prev = [], 0
        for cum in cums:
            if cum <= 0 or cum < prev:
                break
            out.append(cum - prev)
            prev = cum
        if extra > prev:
            out.append(extra - prev)
            prev = extra
        if score > prev:
            out.append(score - prev)
        return out

    a, b = side("A"), side("B")
    if not a and not b:
        return None
    # Both sides show the same number of quarters.
    n = max(len(a), len(b))
    a += [0] * (n - len(a))
    b += [0] * (n - len(b))
    return {"team": a, "opponent": b} if a_side_is_us else {"team": b, "opponent": a}


def _quarters_from_schedule(us: dict[str, Any], them: dict[str, Any]) -> dict[str, list] | None:
    def q(side):
        parts = (side or {}).get("partials") or {}
        values = [to_int(parts.get(f"partials{i}")) for i in range(1, 5)]
        values = [v for v in values if v is not None]
        extra = parts.get("extraPeriods") or {}
        values += [to_int(v) for _, v in sorted(extra.items()) if to_int(v) is not None]
        return values

    t, o = q(us), q(them)
    return {"team": t, "opponent": o} if t or o else None


# ---------------------------------------------------------- v0.3.0 extras

# Season stats ranked across the league: attribute key -> (API field, lower is better).
RANK_STATS: dict[str, tuple[str, bool]] = {
    "points": ("pointsScored", False),
    "rebounds": ("totalRebounds", False),
    "assists": ("assists", False),
    "steals": ("steals", False),
    "turnovers": ("turnovers", True),
    "blocks": ("blocks", False),
    "pir": ("pir", False),
    "fg2_pct": ("twoPointersPercentage", False),
    "fg3_pct": ("threePointersPercentage", False),
    "ft_pct": ("freeThrowsPercentage", False),
}


def _num(value: Any) -> float | None:
    """60.2, '60.2', '60.2%' -> 60.2."""
    if isinstance(value, (int, float)):
        return float(value)
    return to_float(str(value or "").replace("%", ""))


def _rows_of(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("teams", "data", "rows"):
            if isinstance(payload.get(key), list):
                return payload[key]
    return []


def parse_league_ranks(payload: Any, team_code: str) -> dict[str, dict[str, Any]]:
    """Where the team ranks in each season average among all clubs.

    Each stat gives the team's value, its rank (1 = best), and the league's
    worst, best and average, so the card can draw a worst-to-best bar.
    """
    rows = _rows_of(payload)
    out: dict[str, dict[str, Any]] = {}
    for key, (field_name, lower_better) in RANK_STATS.items():
        values = []
        for row in rows:
            code = clean_code((row.get("team") or {}).get("code") or row.get("teamCode"))
            value = _num(row.get(field_name))
            if code and value is not None:
                values.append((code, value))
        mine = next((v for c, v in values if c == team_code), None)
        if mine is None or len(values) < 2:
            continue
        nums = [v for _, v in values]
        better = sum(1 for v in nums if (v < mine if lower_better else v > mine))
        out[key] = {
            "value": round(mine, 1),
            "rank": better + 1,
            "teams": len(nums),
            "worst": round(max(nums) if lower_better else min(nums), 1),
            "best": round(min(nums) if lower_better else max(nums), 1),
            "average": round(sum(nums) / len(nums), 1),
            "lower_is_better": lower_better,
        }
    return out


def attack_defence(all_games: list[dict[str, Any]], team_code: str) -> dict[str, Any] | None:
    """Points scored and allowed per game, ranked against every club.

    Worked out from the schedule so overtime counts (the standings leave it out).
    """
    totals: dict[str, list[int]] = {}
    for game in all_games:
        if not game.get("played"):
            continue
        local, road = game.get("local") or {}, game.get("road") or {}
        ls, rs = to_int(local.get("score")), to_int(road.get("score"))
        if ls is None or rs is None:
            continue
        for side, scored, allowed in ((local, ls, rs), (road, rs, ls)):
            code = clean_code(club_of(side).get("code"))
            t = totals.setdefault(code, [0, 0, 0])
            t[0] += scored
            t[1] += allowed
            t[2] += 1
    if team_code not in totals or len(totals) < 2:
        return None
    avg = {c: (s / n, a / n) for c, (s, a, n) in totals.items() if n}
    scored, allowed = avg[team_code]
    league = sum(s for s, _ in avg.values()) / len(avg)
    return {
        "scored": round(scored, 1),
        "allowed": round(allowed, 1),
        "net": round(scored - allowed, 1),
        "scored_rank": 1 + sum(1 for s, _ in avg.values() if s > scored),
        "allowed_rank": 1 + sum(1 for _, a in avg.values() if a < allowed),
        "league_average": round(league, 1),
        "teams": len(avg),
    }


def season_form(played_games: list[dict[str, Any]], team_code: str) -> list[dict[str, Any]]:
    """Every played game, oldest first, with the point margin."""
    out = []
    for game in played_games:
        s = summarize_game(game, team_code)
        if s.get("team_score") is None:
            continue
        out.append(
            {
                "round": s["round"],
                "date": s["date"],
                "opponent_abbr": s["opponent_abbr"],
                "homeaway": s["homeaway"],
                "team_score": s["team_score"],
                "opponent_score": s["opponent_score"],
                "margin": s["team_score"] - (s["opponent_score"] or 0),
            }
        )
    return out


SHOT_ZONES = ("rim", "paint", "mid_range", "corner_three", "above_break_three")


def shot_zone(x: int, y: int, value: int) -> str:
    """Court zone of a shot; coordinates in cm with the basket at (0, 0)."""
    if value == 3:
        return "corner_three" if abs(x) > 660 and y < 141.5 else "above_break_three"
    if (x * x + y * y) ** 0.5 < 125:
        return "rim"
    if abs(x) <= 245 and y <= 423:
        return "paint"
    return "mid_range"


def zone_counts(points: dict[str, Any], team_code: str) -> dict[str, list[int]]:
    """Made and attempted field goals per zone for one game."""
    counts = {z: [0, 0] for z in SHOT_ZONES}
    for x, y, made, value in (parse_shots(points, team_code) or {}).get("team", []):
        zone = counts[shot_zone(x, y, value)]
        zone[0] += made
        zone[1] += 1
    return counts


def merge_zones(per_game: list[dict[str, list[int]]]) -> dict[str, Any] | None:
    """Season totals per zone, with percentage and points per shot."""
    if not per_game:
        return None
    zones: dict[str, dict[str, Any]] = {}
    made_all = att_all = 0
    for zone in SHOT_ZONES:
        made = sum(g.get(zone, [0, 0])[0] for g in per_game)
        att = sum(g.get(zone, [0, 0])[1] for g in per_game)
        made_all += made
        att_all += att
        value = 3 if zone.endswith("three") else 2
        zones[zone] = {
            "made": made,
            "attempts": att,
            "pct": round(100 * made / att, 1) if att else None,
            "points_per_shot": round(value * made / att, 2) if att else None,
        }
    if not att_all:
        return None
    return {
        "games": len(per_game),
        "made": made_all,
        "attempts": att_all,
        "pct": round(100 * made_all / att_all, 1),
        "zones": zones,
    }


def parse_evolution(evo: dict[str, Any], team_is_home: bool) -> dict[str, Any] | None:
    """Score after every minute for both sides ("Evolution" feed).

    PointsList is [home, away]; minute 0 is the tip-off.
    """
    lists = (evo or {}).get("PointsList") or []
    if len(lists) != 2 or not lists[0]:
        return None
    home = [to_int(v) or 0 for v in lists[0]]
    away = [to_int(v) or 0 for v in lists[1]]
    n = min(len(home), len(away))
    home, away = home[:n], away[:n]
    team, opp = (home, away) if team_is_home else (away, home)
    diffs = [t - o for t, o in zip(team, opp, strict=True)]
    best = max(diffs) if diffs else 0
    worst = min(diffs) if diffs else 0
    return {
        "team": team,
        "opponent": opp,
        "largest_lead": max(best, 0),
        "largest_lead_minute": diffs.index(best) if best > 0 else None,
        "largest_deficit": max(-worst, 0),
        "largest_deficit_minute": diffs.index(worst) if worst < 0 else None,
    }


def head_to_head(
    games: list[dict[str, Any]],
    team_code: str,
    opponent_code: str,
    *,
    limit: int = 5,
) -> dict[str, Any] | None:
    """The latest played meetings with one opponent, newest first."""
    meetings = []
    for game in games:
        codes = {
            clean_code(club_of(game.get("local")).get("code")),
            clean_code(club_of(game.get("road")).get("code")),
        }
        if not game.get("played") or codes != {team_code, opponent_code}:
            continue
        s = summarize_game(game, team_code)
        if s.get("team_score") is None:
            continue
        meetings.append(
            {
                "date": s["date"],
                "season": (game.get("season") or {}).get("code"),
                "round": s["round"],
                "homeaway": s["homeaway"],
                "team_score": s["team_score"],
                "opponent_score": s["opponent_score"],
                "won": s["won"],
            }
        )
    if not meetings:
        return None
    meetings.sort(key=lambda m: m["date"] or "", reverse=True)
    meetings = meetings[:limit]
    wins = sum(1 for m in meetings if m["won"])
    margins = [m["team_score"] - m["opponent_score"] for m in meetings]
    return {
        "opponent_abbr": opponent_code,
        "wins": wins,
        "losses": len(meetings) - wins,
        "average_margin": round(sum(margins) / len(margins), 1),
        "meetings": meetings,
    }


def round_scoreboard(all_games: list[dict[str, Any]], rounds: list[int]) -> dict[str, Any]:
    """Every game of the given rounds, for the card's Round tab."""
    crests: dict[str, str] = {}
    out = []
    for number in rounds:
        games = []
        for game in all_games:
            if game.get("round") != number:
                continue
            local, road = game.get("local") or {}, game.get("road") or {}
            lc, rc = club_of(local), club_of(road)
            for club in (lc, rc):
                crest = (club.get("images") or {}).get("crest")
                if crest:
                    crests[clean_code(club.get("code"))] = crest
            start = game_start(game)
            played = bool(game.get("played"))
            games.append(
                {
                    "game_code": game.get("gameCode"),
                    "date": start.isoformat() if start else None,
                    "home": clean_code(lc.get("code")),
                    "away": clean_code(rc.get("code")),
                    "home_score": to_int(local.get("score")) if played else None,
                    "away_score": to_int(road.get("score")) if played else None,
                    "played": played,
                }
            )
        if games:
            games.sort(key=lambda g: (g["date"] or "", g["game_code"] or 0))
            out.append({"round": number, "games": games})
    return {"rounds": out, "crests": crests}


# ------------------------------------------------------ v0.4.0 postseason

POSTSEASON = ("PI", "PO", "FF")
PLAYOFF_BEST_OF = 5
PLAY_IN_LABELS = {"A": "7th v 8th", "B": "9th v 10th", "C": "for 8th place"}


def phase_code(game: dict[str, Any]) -> str:
    """'RS' (regular season), 'PI' (play-in), 'PO' (playoffs), 'FF' (Final Four)…"""
    return clean_code((game.get("phaseType") or {}).get("code")) or "RS"


def _group(game: dict[str, Any]) -> str:
    """'PLAYOFF A ' -> 'PLAYOFF A' (the API pads some names)."""
    group = game.get("group") or {}
    return " ".join(str(group.get("rawName") or group.get("name") or "").upper().split())


def _codes(game: dict[str, Any]) -> tuple[str, str]:
    return clean_code(club_of(game.get("local")).get("code")), clean_code(
        club_of(game.get("road")).get("code")
    )


def _series_games(games: list[dict[str, Any]], game: dict[str, Any]) -> list[dict[str, Any]]:
    """Every game of the playoff series this game belongs to, oldest first."""
    pair, group = set(_codes(game)), _group(game)
    out = [g for g in games if phase_code(g) == "PO" and _group(g) == group and set(_codes(g)) == pair]
    return sorted(
        out, key=lambda g: (game_start(g) or datetime.max.replace(tzinfo=UTC), g.get("gameCode") or 0)
    )


def _winner(game: dict[str, Any]) -> str | None:
    """The game's winner from the score (the API's `winner` field names the season champion)."""
    if not game.get("played"):
        return None
    (hc, ac), hs, as_ = (
        _codes(game),
        to_int((game.get("local") or {}).get("score")),
        to_int((game.get("road") or {}).get("score")),
    )
    if hs is None or as_ is None or hs == as_:
        return None
    return hc if hs > as_ else ac


def game_label(game: dict[str, Any], games: list[dict[str, Any]]) -> str | None:
    """'Playoffs · Game 3', 'Play-in · 7th v 8th', 'Final Four · Semifinal'; None in the regular season."""
    phase = phase_code(game)
    group = _group(game)
    if phase == "PI":
        letter = group.split()[-1] if group else ""
        sub = PLAY_IN_LABELS.get(letter)
        return f"Play-in · {sub}" if sub else "Play-in"
    if phase == "PO":
        series = _series_games(games, game)
        number = next(
            (i + 1 for i, g in enumerate(series) if g.get("gameCode") == game.get("gameCode")), None
        )
        return f"Playoffs · Game {number}" if number else "Playoffs"
    if phase == "FF":
        if "SEMI" in group:
            return "Final Four · Semifinal"
        if "THIRD" in group:
            return "Final Four · Third place game"
        if "CHAMPIONSHIP" in group or "FINAL" in group:
            return "Final Four · Championship game"
        return "Final Four"
    return None


def series_state(games: list[dict[str, Any]], game: dict[str, Any], team_code: str) -> dict[str, Any] | None:
    """Where a best-of-five playoff series stands, from the team's side."""
    if phase_code(game) != "PO":
        return None
    series = _series_games(games, game)
    codes = _codes(game)
    if team_code not in codes:
        return None
    opponent = codes[1] if codes[0] == team_code else codes[0]
    need = PLAYOFF_BEST_OF // 2 + 1
    wins = losses = 0
    out_games = []
    this = next(
        (i for i, g in enumerate(series) if g.get("gameCode") == game.get("gameCode")), len(series) - 1
    )
    for number, g in enumerate(series, start=1):
        s = summarize_game(g, team_code)
        winner = _winner(g)
        # The series as it stood after this game (later games don't count yet).
        if number - 1 <= this:
            wins += winner == team_code
            losses += winner == opponent
        out_games.append(
            {
                "game_number": number,
                "date": s["date"],
                "homeaway": s["homeaway"],
                "played": bool(g.get("played")),
                "team_score": s.get("team_score"),
                "opponent_score": s.get("opponent_score"),
                "won": s.get("won") if g.get("played") else None,
            }
        )
    if wins >= need:
        status = f"{team_code} win the series {wins}-{losses}"
    elif losses >= need:
        status = f"{opponent} win the series {losses}-{wins}"
    elif wins == losses:
        status = f"Series tied {wins}-{losses}"
    elif wins > losses:
        status = f"{team_code} lead {wins}-{losses}"
    else:
        status = f"{opponent} lead {losses}-{wins}"
    return {
        "group": _group(game),
        "best_of": PLAYOFF_BEST_OF,
        "game_number": this + 1,
        "wins": wins,
        "opponent_wins": losses,
        "decided": max(wins, losses) >= need,
        "status": status,
        "games": out_games,
    }


def drop_unneeded(games: list[dict[str, Any]], team_code: str) -> list[dict[str, Any]]:
    """Leave out 'if necessary' playoff games of a series that is already decided."""
    need = PLAYOFF_BEST_OF // 2 + 1
    out = []
    for g in games:
        if not g.get("played") and phase_code(g) == "PO":
            series = _series_games(games, g)
            winners = [_winner(s) for s in series]
            if any(winners.count(code) >= need for code in set(_codes(g))):
                continue
        out.append(g)
    return out


def postseason_attributes(
    game: dict[str, Any], games: list[dict[str, Any]], team_code: str, standings: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    """Extra game attributes for play-in, playoff and Final Four games."""
    phase = phase_code(game)
    attrs: dict[str, Any] = {
        "phase_code": phase,
        "neutral_site": phase == "FF" or bool(game.get("isNeutralVenue")),
        "series": series_state(games, game, team_code),
        "team_seed": None,
        "opponent_seed": None,
    }
    label = game_label(game, games)
    if label:
        attrs["round_name"] = label
    if phase in POSTSEASON:
        codes = _codes(game)
        opponent = codes[1] if codes[0] == team_code else codes[0]
        attrs["team_seed"] = (standings.get(team_code) or {}).get("position")
        attrs["opponent_seed"] = (standings.get(opponent) or {}).get("position")
    return attrs


def _bracket_game(game: dict[str, Any]) -> dict[str, Any]:
    (hc, ac), start = _codes(game), game_start(game)
    played = bool(game.get("played"))
    return {
        "game_code": game.get("gameCode"),
        "date": start.isoformat() if start else None,
        "home": hc,
        "away": ac,
        "home_score": to_int((game.get("local") or {}).get("score")) if played else None,
        "away_score": to_int((game.get("road") or {}).get("score")) if played else None,
        "played": played,
        "winner": _winner(game),
    }


def parse_bracket(
    all_games: list[dict[str, Any]], standings_rows: list[dict[str, Any]]
) -> dict[str, Any] | None:
    """Play-in, playoff series and Final Four, once the postseason is on the schedule."""
    post = [g for g in all_games if phase_code(g) in POSTSEASON and all(_codes(g))]
    if not post:
        return None
    seeds = {r["code"]: r["position"] for r in standings_rows}
    by_start = lambda g: (game_start(g) or datetime.max.replace(tzinfo=UTC), g.get("gameCode") or 0)  # noqa: E731

    play_in = []
    for g in sorted((g for g in post if phase_code(g) == "PI"), key=by_start):
        letter = _group(g).split()[-1] if _group(g) else ""
        play_in.append({**_bracket_game(g), "group": letter, "label": PLAY_IN_LABELS.get(letter)})

    need = PLAYOFF_BEST_OF // 2 + 1
    series: dict[str, list[dict[str, Any]]] = {}
    for g in sorted((g for g in post if phase_code(g) == "PO"), key=by_start):
        series.setdefault(_group(g), []).append(g)
    playoffs = []
    for group in sorted(series):
        games = series[group]
        codes = sorted(set(_codes(games[0])), key=lambda c: seeds.get(c) or 99)
        winners = [_winner(g) for g in games]
        sides = [{"code": c, "seed": seeds.get(c), "wins": winners.count(c)} for c in codes]
        champ = next((s["code"] for s in sides if s["wins"] >= need), None)
        playoffs.append(
            {
                "group": group.split()[-1],
                "top": sides[0],
                "bottom": sides[1] if len(sides) > 1 else None,
                "best_of": PLAYOFF_BEST_OF,
                "winner": champ,
                "games": [_bracket_game(g) for g in games if g.get("played") or not champ],
            }
        )

    ff = sorted((g for g in post if phase_code(g) == "FF"), key=by_start)
    semis = [_bracket_game(g) for g in ff if "SEMI" in _group(g)]
    third = next((_bracket_game(g) for g in ff if "THIRD" in _group(g)), None)
    final = next((_bracket_game(g) for g in ff if "SEMI" not in _group(g) and "THIRD" not in _group(g)), None)
    venue = next(((g.get("venue") or {}).get("name") for g in ff if g.get("venue")), None)
    return {
        "play_in": play_in,
        "playoffs": playoffs,
        "final_four": {"semifinals": semis, "final": final, "third_place": third, "venue": venue},
        "champion": (final or {}).get("winner"),
        "seeds": {c: s for c, s in seeds.items() if s is not None and s <= PLAY_IN_SPOTS},
    }


# ----------------------------------------------------------- playoff race


def playoff_race(
    rows: list[dict[str, Any]], all_games: list[dict[str, Any]], team_code: str
) -> dict[str, Any] | None:
    """How the team stands against the playoff (6th) and play-in (10th) lines.

    Clinched and eliminated are worked out conservatively, from wins alone
    (ties count against the team), so they never show too early.
    """
    me = next((r for r in rows if r["code"] == team_code), None)
    if not me or me["position"] is None:
        return None
    remaining: dict[str, int] = {}
    last_date = None
    for g in all_games:
        if phase_code(g) != "RS":
            continue
        start = game_start(g)
        if start and (last_date is None or start > last_date):
            last_date = start
        if not g.get("played"):
            for code in _codes(g):
                remaining[code] = remaining.get(code, 0) + 1
    # A missing or partial schedule must never make a clinch look certain: in a
    # double round-robin every club plays 2 x (clubs - 1) games.
    full = 2 * (len(rows) - 1)
    for r in rows:
        played = (r.get("wins") or 0) + (r.get("losses") or 0)
        remaining[r["code"]] = max(remaining.get(r["code"], 0), full - played)
    others = [r for r in rows if r["code"] != team_code and r["wins"] is not None]
    my_max = me["wins"] + remaining.get(team_code, 0)

    def line(spot: int) -> dict[str, Any] | None:
        if len(rows) <= spot:
            return None
        inside = me["position"] <= spot
        rival = next((r for r in rows if r["position"] == (spot + 1 if inside else spot)), None)
        if rival is None:
            return None
        gap = ((me["wins"] - rival["wins"]) + (rival["losses"] - me["losses"])) / 2
        can_catch = sum(1 for r in others if r["wins"] + remaining.get(r["code"], 0) >= me["wins"])
        ahead_for_sure = sum(1 for r in others if r["wins"] > my_max)
        status = (
            "clinched"
            if can_catch < spot
            else "eliminated"
            if ahead_for_sure >= spot
            else "in"
            if inside
            else "out"
        )
        # Inside the line: games clear of the first team below it; outside: games behind the last team in.
        return {"line": spot, "status": status, "inside": inside, "games": abs(gap), "rival": rival["code"]}

    return {
        "games_remaining": remaining.get(team_code, 0),
        "last_game_date": last_date.isoformat() if last_date else None,
        "playoffs": line(PLAYOFF_SPOTS),
        "play_in": line(PLAY_IN_SPOTS),
    }


# --------------------------------------------------------------- calendar


def calendar_events(
    games: list[dict[str, Any]], team_code: str, competition_name: str
) -> list[dict[str, Any]]:
    """The team's season as calendar events (home team first)."""
    out = []
    for g in games:
        start = game_start(g)
        if not start:
            continue
        local, road = club_of(g.get("local")), club_of(g.get("road"))
        home_name = short_name(local)
        away_name = short_name(road)
        label = (
            game_label(g, games) or g.get("roundName") or (f"Round {g['round']}" if g.get("round") else "")
        )
        s = summarize_game(g, team_code)
        lines = [f"{competition_name} · {label}" if label else competition_name]
        if s.get("team_score") is not None:
            lines.append(result_text(s) or "")
        venue = (g.get("venue") or {}).get("name")
        out.append(
            {
                "uid": f"{(g.get('season') or {}).get('code', '')}_{g.get('gameCode')}",
                "summary": f"{home_name} vs {away_name}",
                "start": start,
                "end": start + GAME_LENGTH,
                "location": titlecase_venue(venue),
                "description": "\n".join(x for x in lines if x),
            }
        )
    out.sort(key=lambda e: e["start"])
    return out


def titlecase_venue(venue: str | None) -> str | None:
    """'SUNEL ARENA' -> 'Sunel Arena'."""
    if not venue:
        return None
    if venue != venue.upper():
        return venue
    return " ".join(w.capitalize() for w in venue.split())
