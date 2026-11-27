"""Data coordinator: decides what to fetch and how often."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from . import parser
from .api import EuroLeagueApi, EuroLeagueApiError, EuroLeagueAuthError
from .const import (
    COMPETITIONS,
    CONF_COMPETITION,
    CONF_FETCH_LEADERS,
    CONF_LIVE_INTERVAL,
    CONF_POST_GAME_HOURS,
    CONF_TEAM_CODE,
    DEFAULT_FETCH_LEADERS,
    DEFAULT_LIVE_INTERVAL,
    DEFAULT_POST_GAME_HOURS,
    DOMAIN,
    EVENT_NAME,
    INTERVAL_GAME_DAY,
    INTERVAL_IDLE,
    INTERVAL_POST_GAME,
    INTERVAL_PRE_GAME,
    STATE_IN,
    STATE_NOT_FOUND,
    STATE_POST,
    STATE_PRE,
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
        mine = parser.team_games(all_games, self.team_code)
        game, mode = parser.select_game(mine, now, self.post_game_hours)

        header = box = pbp = shots = None
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
                box, pbp, shots = await self._game_feeds(season_code, code, final=state == STATE_POST)
                if state == STATE_POST and header is None:
                    header = await self._safe(api.header(season_code, code)) or {}

            # The game we followed live just ended: drop cached schedule,
            # standings and season stats so they reflect the result.
            if self._tracked_live_game == code and state == STATE_POST:
                for prefix in ("games:", "standings:", "teamstats:", "leaders:"):
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

        team_stats = parser.parse_team_stats(
            await self._safe(api.team_stats(season_code, self.team_code)) or {}
        )
        leaders: dict[str, Any] = {}
        if self.fetch_leaders:
            leaders = parser.parse_leaders(await self._safe(api.leaders(season_code)) or {}, self.team_code)

        data = TrackerData(
            state=state,
            game=game_attrs,
            standings=standings_rows,
            standings_round=standings_round,
            team_stats=team_stats,
            leaders=leaders,
            season=season_code,
        )
        self._fire_events(self.data, data)
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

    async def _game_feeds(self, season_code: str, code: int, final: bool) -> tuple[dict, dict, dict]:
        """Box score, play-by-play and shots. A finished game is fetched once."""
        if final and code in self._final_box_cache:
            return self._final_box_cache[code]
        box = await self._safe(self.api.boxscore(season_code, code)) or {}
        pbp = await self._safe(self.api.play_by_play(season_code, code)) or {}
        shots = await self._safe(self.api.shots(season_code, code)) or {}
        if final and box:
            self._final_box_cache = {code: (box, pbp, shots)}  # keep only the latest final
        return box, pbp, shots

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

    # -------------------------------------------------------------- events

    def _fire_events(self, old: TrackerData | None, new: TrackerData) -> None:
        if old is None:
            return
        o, n = old.game, new.game
        if o.get("game_code") != n.get("game_code") and not (
            old.state == STATE_IN and new.state == STATE_POST
        ):
            # Different game: only announce a new tip-off.
            if new.state == STATE_IN:
                self._fire("game_started", n)
            return

        if old.state == STATE_PRE and new.state == STATE_IN:
            self._fire("game_started", n)
        if old.state == STATE_IN and new.state == STATE_POST:
            self._fire("game_final", n, won=bool(n.get("team_winner")))
        if new.state != STATE_IN or old.state != STATE_IN:
            return

        if (o.get("quarter") or 0) < (n.get("quarter") or 0):
            self._fire("quarter_end", n, quarter=o.get("quarter"))
        ts_o, ts_n = o.get("team_score") or 0, n.get("team_score") or 0
        os_o, os_n = o.get("opponent_score") or 0, n.get("opponent_score") or 0
        if ts_n > ts_o:
            self._fire("team_scored", n, points=ts_n - ts_o)
        if os_n > os_o:
            self._fire("opponent_scored", n, points=os_n - os_o)
        lead_o = (ts_o > os_o) - (ts_o < os_o)
        lead_n = (ts_n > os_n) - (ts_n < os_n)
        if lead_n != 0 and lead_n != lead_o:
            self._fire("lead_change", n, leader="team" if lead_n > 0 else "opponent")

    def _fire(self, kind: str, game: dict[str, Any], **extra: Any) -> None:
        self.hass.bus.async_fire(
            EVENT_NAME,
            {
                "type": kind,
                "entry_id": self.config_entry.entry_id,
                "team": self.team_code,
                "opponent": game.get("opponent_abbr"),
                "team_score": game.get("team_score"),
                "opponent_score": game.get("opponent_score"),
                "quarter": game.get("quarter"),
                "clock": game.get("clock"),
                "game_code": game.get("game_code"),
                **extra,
            },
        )
