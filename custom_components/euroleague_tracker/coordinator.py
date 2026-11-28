"""Data coordinator: decides what to fetch and how often."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from . import parser
from .api import EuroLeagueApi, EuroLeagueApiError, EuroLeagueAuthError
from .const import (
    COMPETITIONS,
    CONF_COMPETITION,
    CONF_EVENT_DELAY,
    CONF_FETCH_LEADERS,
    CONF_LIVE_INTERVAL,
    CONF_POST_GAME_HOURS,
    CONF_TEAM_CODE,
    DEFAULT_EVENT_DELAY,
    DEFAULT_FETCH_LEADERS,
    DEFAULT_LIVE_INTERVAL,
    DEFAULT_POST_GAME_HOURS,
    DOMAIN,
    EVENT_NAME,
    H2H_PAST_SEASONS,
    INTERVAL_GAME_DAY,
    INTERVAL_IDLE,
    INTERVAL_POST_GAME,
    INTERVAL_PRE_GAME,
    PLAY_IN_SPOTS,
    PLAYOFF_SPOTS,
    STATE_IN,
    STATE_NOT_FOUND,
    STATE_POST,
    STATE_PRE,
    ZONE_FETCHES_PER_UPDATE,
)

_LOGGER = logging.getLogger(__name__)


@dataclass
class TrackerData:
    """Everything the sensors need, produced by one update."""

    state: str
    game: dict[str, Any] = field(default_factory=dict)
    standings: list[dict[str, Any]] = field(default_factory=list)
    standings_round: int | None = None
    team_stats: dict[str, Any] = field(default_factory=dict)
    leaders: dict[str, Any] = field(default_factory=dict)
    season: str | None = None
    next_game_start: datetime | None = None
    last_result: str | None = None
    streak: str | None = None
    games_behind_playoffs: float | None = None
    games_behind_play_in: float | None = None
    league_ranks: dict[str, Any] = field(default_factory=dict)
    attack_defence: dict[str, Any] | None = None
    form: list[dict[str, Any]] = field(default_factory=list)
    shot_zones: dict[str, Any] | None = None
    scoreboard: dict[str, Any] = field(default_factory=dict)
    playoff_race: dict[str, Any] | None = None
    bracket: dict[str, Any] | None = None
    calendar: list[dict[str, Any]] = field(default_factory=list)


def signal_scored(entry_id: str) -> str:
    """Dispatcher signal for each basket (after the configured delay)."""
    return f"{DOMAIN}_{entry_id}_scored"


def signal_game_event(entry_id: str) -> str:
    """Dispatcher signal for tip-off, quarter end, lead change and final."""
    return f"{DOMAIN}_{entry_id}_game_event"


type EuroLeagueConfigEntry = ConfigEntry[EuroLeagueCoordinator]


class EuroLeagueCoordinator(DataUpdateCoordinator[TrackerData]):
    """Fetches EuroLeague data for one followed team."""

    config_entry: EuroLeagueConfigEntry

    def __init__(self, hass: HomeAssistant, entry: EuroLeagueConfigEntry, api: EuroLeagueApi) -> None:
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{entry.data[CONF_TEAM_CODE]}",
            update_interval=INTERVAL_IDLE,
        )
        self.api = api
        self.team_code: str = entry.data[CONF_TEAM_CODE]
        self.competition: str = entry.data.get(CONF_COMPETITION, "E")
        self._final_box_cache: dict[int, tuple[dict, dict, dict]] = {}
        self._tracked_live_game: int | None = None
        # Basket tracking: the game being followed and the last play number seen.
        self._scoring_game: int | None = None
        self._last_seq: int = 0
        self._pending: list[CALLBACK_TYPE] = []
        # Season shot zones per finished game, and our games from past seasons.
        self._zones: dict[tuple[str, int], dict[str, list[int]]] = {}
        self._past_games: dict[str, list[dict[str, Any]]] = {}

    # ------------------------------------------------------------- options

    @property
    def live_interval(self) -> timedelta:
        return timedelta(seconds=self.config_entry.options.get(CONF_LIVE_INTERVAL, DEFAULT_LIVE_INTERVAL))

    @property
    def post_game_hours(self) -> float:
        return self.config_entry.options.get(CONF_POST_GAME_HOURS, DEFAULT_POST_GAME_HOURS)

    @property
    def fetch_leaders(self) -> bool:
        return self.config_entry.options.get(CONF_FETCH_LEADERS, DEFAULT_FETCH_LEADERS)

    @property
    def event_delay(self) -> float:
        """Seconds to hold live events back, to line up with a delayed TV stream."""
        return float(self.config_entry.options.get(CONF_EVENT_DELAY, DEFAULT_EVENT_DELAY))

    # -------------------------------------------------------------- update

    async def _async_update_data(self) -> TrackerData:
        try:
            data = await self._update(datetime.now(UTC))
        except EuroLeagueAuthError as err:
            # EuroLeague started refusing anonymous access. There's nothing the
            # user can enter, so show a Repairs issue and keep retrying.
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                "api_access_refused",
                is_fixable=False,
                severity=ir.IssueSeverity.ERROR,
                translation_key="api_access_refused",
                learn_more_url="https://github.com/Big-Edge2297/ha-euroleague-tracker/issues",
            )
            raise UpdateFailed(str(err)) from err
        except EuroLeagueApiError as err:
            raise UpdateFailed(str(err)) from err
        ir.async_delete_issue(self.hass, DOMAIN, "api_access_refused")
        return data

    async def _update(self, now: datetime) -> TrackerData:
        api = self.api
        season = await api.current_season(now)
        season_code = season["code"]
        comp_name = COMPETITIONS.get(self.competition, self.competition)

        all_games = await api.games(season_code)
        # "If necessary" playoff games of a decided series never happen.
        mine = parser.drop_unneeded(parser.team_games(all_games, self.team_code), self.team_code)
        game, mode = parser.select_game(mine, now, self.post_game_hours)

        header = box = pbp = shots = evo = None
        baskets: list[dict[str, Any]] = []
        state = STATE_NOT_FOUND
        if game is not None:
            code = game["gameCode"]
            start = parser.game_start(game)
            if mode == "check_live":
                header = await api.header(season_code, code)
                state = parser.live_state(header, start, now)
            elif mode == "post":
                state = STATE_POST
            else:
                state = STATE_PRE

            if state in (STATE_IN, STATE_POST):
                box, pbp, shots, evo = await self._game_feeds(season_code, code, final=state == STATE_POST)
                if state == STATE_POST and header is None:
                    header = await self._safe(api.header(season_code, code)) or {}

            baskets = self._new_baskets(code, state, pbp)

            # The game we followed live just ended: drop cached schedule,
            # standings and season stats so they reflect the result.
            if self._tracked_live_game == code and state == STATE_POST:
                for prefix in ("games:", "standings:", "teamstats:", "teamtrad:", "leaders:"):
                    api.invalidate(prefix)
            self._tracked_live_game = code if state == STATE_IN else None

        standings_rows, standings_round = await self._standings(season_code, now)
        by_code = parser.standings_by_code(standings_rows)

        played = [g for g in mine if g.get("played")]
        upcoming = [g for g in mine if not g.get("played") and g is not game]
        prev_game = next(
            (parser.summarize_game(g, self.team_code) for g in reversed(played) if g is not game),
            None,
        )
        next_game = next(
            (
                parser.summarize_game(g, self.team_code)
                for g in upcoming
                if (parser.game_start(g) or now) > now
            ),
            None,
        )

        game_attrs = parser.build_game_attributes(
            game=game,
            state=state,
            team_code=self.team_code,
            competition_name=comp_name,
            season_code=season_code,
            now=now,
            header=header,
            box=box,
            pbp=pbp,
            standings=by_code,
            prev_game=prev_game,
            next_game=next_game,
            shots=shots,
        )

        if game is not None:
            game_attrs.update(parser.postseason_attributes(game, mine, self.team_code, by_code))
            home = game_attrs.get("team_homeaway") == "home"
            game_attrs["score_flow"] = parser.parse_evolution(evo, home) if evo else None
            past = await self._past_meetings(season)
            game_attrs["head_to_head"] = parser.head_to_head(
                past + played, self.team_code, game_attrs.get("opponent_abbr") or ""
            )

        team_stats = parser.parse_team_stats(
            await self._safe(api.team_stats(season_code, self.team_code)) or {}
        )
        leaders: dict[str, Any] = {}
        if self.fetch_leaders:
            leaders = parser.parse_leaders(await self._safe(api.leaders(season_code)) or {}, self.team_code)

        if state == STATE_PRE and game is not None:
            next_start = parser.game_start(game)
        else:
            next_start = parser.parse_dt((next_game or {}).get("date"))
        if state == STATE_POST:
            # Right after the buzzer the cached schedule may not mark this game
            # as played yet, so the result comes from the live data.
            last_summary = {
                "team_score": game_attrs.get("team_score"),
                "opponent_score": game_attrs.get("opponent_score"),
                "homeaway": game_attrs.get("team_homeaway"),
                "opponent_abbr": game_attrs.get("opponent_abbr"),
                "won": game_attrs.get("team_winner"),
            }
            earlier = [g for g in played if g is not game]
            current_streak = _streak_with_final(earlier, self.team_code, game_attrs.get("team_winner"))
        else:
            last_summary = prev_game
            current_streak = parser.streak(played, self.team_code)

        centre = (game or {}).get("round") or standings_round
        scoreboard = parser.round_scoreboard(all_games, [centre - 1, centre, centre + 1]) if centre else {}

        data = TrackerData(
            state=state,
            game=game_attrs,
            standings=standings_rows,
            standings_round=standings_round,
            team_stats=team_stats,
            leaders=leaders,
            season=season_code,
            next_game_start=next_start,
            last_result=parser.result_text(last_summary),
            streak=current_streak,
            games_behind_playoffs=parser.games_behind(standings_rows, self.team_code, PLAYOFF_SPOTS),
            games_behind_play_in=parser.games_behind(standings_rows, self.team_code, PLAY_IN_SPOTS),
            league_ranks=parser.parse_league_ranks(
                await self._safe(api.team_traditional(season_code)) or {}, self.team_code
            ),
            attack_defence=parser.attack_defence(all_games, self.team_code),
            form=parser.season_form(played, self.team_code),
            shot_zones=await self._season_zones(season_code, played, fetch=state != STATE_IN),
            scoreboard=scoreboard,
            playoff_race=parser.playoff_race(standings_rows, all_games, self.team_code),
            bracket=parser.parse_bracket(all_games, standings_rows),
            calendar=parser.calendar_events(mine, self.team_code, comp_name),
        )
        self._fire_events(self.data, data)
        for basket in baskets:
            self._schedule(self._send_basket, basket, data.game)
        self.update_interval = self._next_interval(state, game, now)
        return data

    async def _standings(self, season_code: str, now: datetime) -> tuple[list, int | None]:
        rounds = await self._safe(self.api.rounds(season_code)) or []
        rnd = parser.current_round(rounds, now)
        if rnd is None:
            return [], None
        payload = await self._safe(self.api.standings(season_code, rnd)) or {}
        rows = parser.parse_standings(payload)
        if not rows and rnd > 1:  # round just started and has no table yet
            payload = await self._safe(self.api.standings(season_code, rnd - 1)) or {}
            rows, rnd = parser.parse_standings(payload), rnd - 1
        return rows, rnd

    async def _game_feeds(self, season_code: str, code: int, final: bool) -> tuple[dict, dict, dict, dict]:
        """Box score, play-by-play, shots and score flow. A finished game is fetched once."""
        if final and code in self._final_box_cache:
            return self._final_box_cache[code]
        box = await self._safe(self.api.boxscore(season_code, code)) or {}
        pbp = await self._safe(self.api.play_by_play(season_code, code)) or {}
        shots = await self._safe(self.api.shots(season_code, code)) or {}
        evo = await self._safe(self.api.evolution(season_code, code)) or {}
        if final and box:
            self._final_box_cache = {code: (box, pbp, shots, evo)}  # keep only the latest final
            if shots:
                self._zones[(season_code, code)] = parser.zone_counts(shots, self.team_code)
        return box, pbp, shots, evo

    async def _season_zones(
        self, season_code: str, played: list[dict[str, Any]], *, fetch: bool
    ) -> dict[str, Any] | None:
        """Season shooting by zone. Each finished game's shots are fetched once,
        a few games per update so the first start stays quick, and never while
        a game is live (those updates must stay fast)."""
        missing = [g["gameCode"] for g in played if (season_code, g["gameCode"]) not in self._zones]
        for code in missing[:ZONE_FETCHES_PER_UPDATE] if fetch else []:
            points = await self._safe(self.api.shots(season_code, code))
            if points:
                self._zones[(season_code, code)] = parser.zone_counts(points, self.team_code)
        return parser.merge_zones([z for (s, _), z in self._zones.items() if s == season_code])

    async def _past_meetings(self, season: dict[str, Any]) -> list[dict[str, Any]]:
        """Our games from the two seasons before this one (fetched once each)."""
        seasons = await self._safe(self.api.seasons()) or []
        year = season.get("year") or 0
        earlier = sorted((s for s in seasons if (s.get("year") or 0) < year), key=lambda s: s.get("year", 0))
        out: list[dict[str, Any]] = []
        for past in earlier[-H2H_PAST_SEASONS:]:
            code = past.get("code")
            if code not in self._past_games:
                games = await self._safe(self.api.past_games(code))
                if games is None:
                    continue
                self._past_games[code] = [
                    g for g in parser.team_games(games, self.team_code) if g.get("played")
                ]
            out.extend(self._past_games[code])
        return out

    async def _safe(self, coro):
        """Optional data: log and carry on instead of failing the whole update."""
        try:
            return await coro
        except EuroLeagueAuthError:
            raise
        except EuroLeagueApiError as err:
            _LOGGER.debug("Optional EuroLeague request failed: %s", err)
            return None

    def _next_interval(self, state: str, game: dict | None, now: datetime) -> timedelta:
        if state == STATE_IN:
            return self.live_interval
        start = parser.game_start(game) if game else None
        if state == STATE_PRE and start:
            until = start - now
            if until <= timedelta(hours=1):
                return INTERVAL_PRE_GAME
            if until <= timedelta(hours=12):
                return INTERVAL_GAME_DAY
        if state == STATE_POST and start and now - start <= timedelta(hours=4):
            return INTERVAL_POST_GAME
        return INTERVAL_IDLE

    # ------------------------------------------------------------- baskets

    def _new_baskets(self, code: int, state: str, pbp: dict | None) -> list[dict[str, Any]]:
        """Baskets scored since the last update, oldest first.

        The first time a game is seen live (for example after a restart mid-game)
        its baskets so far are only recorded, not fired, so nobody gets a burst of
        old events. If the previous update showed this game before tip-off, the
        baskets since then are real news and do fire.
        """
        if state not in (STATE_IN, STATE_POST) or not pbp:
            return []
        plays = parser.scoring_plays(pbp, self.team_code)
        if self._scoring_game == code:
            new = [p for p in plays if p["seq"] > self._last_seq]
        elif (
            state == STATE_IN
            and self.data is not None
            and self.data.state == STATE_PRE
            and self.data.game.get("game_code") == code
        ):
            new = plays
        else:
            new = []
        if plays:
            self._last_seq = max(self._last_seq if self._scoring_game == code else 0, plays[-1]["seq"])
        # Keep following until the final update has been read.
        self._scoring_game = code if state == STATE_IN else None
        return new

    # -------------------------------------------------------------- events

    def _schedule(self, func, *args: Any) -> None:
        """Run now, or after the configured delay (to match a TV stream)."""
        delay = self.event_delay
        if delay <= 0:
            func(*args)
            return

        @callback
        def _run(_now: datetime) -> None:
            self._pending.remove(cancel)
            func(*args)

        cancel = async_call_later(self.hass, delay, _run)
        self._pending.append(cancel)

    @callback
    def async_cancel_pending(self) -> None:
        """Drop delayed events (on unload)."""
        while self._pending:
            self._pending.pop()()

    def _fire_events(self, old: TrackerData | None, new: TrackerData) -> None:
        if old is None:
            return
        o, n = old.game, new.game
        if o.get("game_code") != n.get("game_code") and not (
            old.state == STATE_IN and new.state == STATE_POST
        ):
            # Different game: only announce a new tip-off.
            if new.state == STATE_IN:
                self._schedule(self._send_event, "game_started", n, {})
            return

        if old.state == STATE_PRE and new.state == STATE_IN:
            self._schedule(self._send_event, "game_started", n, {})
        if old.state == STATE_IN and new.state == STATE_POST:
            self._schedule(self._send_event, "game_final", n, {"won": bool(n.get("team_winner"))})
        if new.state != STATE_IN or old.state != STATE_IN:
            return

        if (o.get("quarter") or 0) < (n.get("quarter") or 0):
            self._schedule(self._send_event, "quarter_end", n, {"quarter": o.get("quarter")})
        ts_o, ts_n = o.get("team_score") or 0, n.get("team_score") or 0
        os_o, os_n = o.get("opponent_score") or 0, n.get("opponent_score") or 0
        lead_o = (ts_o > os_o) - (ts_o < os_o)
        lead_n = (ts_n > os_n) - (ts_n < os_n)
        if lead_n != 0 and lead_n != lead_o:
            self._schedule(
                self._send_event, "lead_change", n, {"leader": "team" if lead_n > 0 else "opponent"}
            )

    def _base(self, game: dict[str, Any]) -> dict[str, Any]:
        return {
            "entry_id": self.config_entry.entry_id,
            "team": self.team_code,
            "opponent": game.get("opponent_abbr"),
            "team_score": game.get("team_score"),
            "opponent_score": game.get("opponent_score"),
            "quarter": game.get("quarter"),
            "clock": game.get("clock"),
            "game_code": game.get("game_code"),
        }

    @callback
    def _send_event(self, kind: str, game: dict[str, Any], extra: dict[str, Any]) -> None:
        data = {**self._base(game), **extra}
        self.hass.bus.async_fire(EVENT_NAME, {"type": kind, **data})
        async_dispatcher_send(self.hass, signal_game_event(self.config_entry.entry_id), kind, data)

    @callback
    def _send_basket(self, basket: dict[str, Any], game: dict[str, Any]) -> None:
        kind = "team_scored" if basket["side"] == "team" else "opponent_scored"
        data = {
            **self._base(game),
            # The score and clock at this basket, not at the end of the update.
            "team_score": basket["team_score"],
            "opponent_score": basket["opponent_score"],
            "quarter": basket["quarter"],
            "clock": basket["clock"],
            "points": basket["points"],
            "shot": basket["type"],
            "player": basket["player"],
        }
        self.hass.bus.async_fire(EVENT_NAME, {"type": kind, **data})
        async_dispatcher_send(
            self.hass, signal_scored(self.config_entry.entry_id), basket["side"], basket["type"], data
        )


def _streak_with_final(earlier: list[dict[str, Any]], team_code: str, won: bool | None) -> str | None:
    """The streak once the just-finished game is added to the earlier results."""
    before = parser.streak(earlier, team_code)
    if won is None:
        return before
    letter = "W" if won else "L"
    if before and before[0] == letter:
        return f"{letter}{int(before[1:]) + 1}"
    return f"{letter}1"
