"""Sensors: the game (teamtracker-compatible), standings, stats and smaller pieces."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import COMPETITIONS, STATE_IN, STATE_NOT_FOUND, STATE_POST, STATE_PRE, TEAM_COLORS
from .coordinator import EuroLeagueConfigEntry, EuroLeagueCoordinator, TrackerData
from .entity import EuroLeagueEntityMixin
from .parser import ordinal

try:  # Home Assistant 2025.2+
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
except ImportError:  # 2025.1
    from homeassistant.helpers.entity_platform import (
        AddEntitiesCallback as AddConfigEntryEntitiesCallback,
    )

GAME_STATUS = {STATE_PRE: "upcoming", STATE_IN: "live", STATE_POST: "final", STATE_NOT_FOUND: "no_game"}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EuroLeagueConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(
        [
            GameSensor(coordinator),
            StandingsSensor(coordinator),
            StatsSensor(coordinator),
            *(SimpleSensor(coordinator, description) for description in SIMPLE_SENSORS),
        ]
    )


class _Base(EuroLeagueEntityMixin, CoordinatorEntity[EuroLeagueCoordinator], SensorEntity):
    def __init__(self, coordinator: EuroLeagueCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._setup_identity(coordinator, key)

    @property
    def _common(self) -> dict[str, Any]:
        return {
            "team_abbr": self.coordinator.team_code,
            "team_color": TEAM_COLORS.get(self.coordinator.team_code),
            "competition": COMPETITIONS.get(self.coordinator.competition),
            "season": self.coordinator.data.season if self.coordinator.data else None,
        }


# --------------------------------------------------------- the three originals


class GameSensor(_Base):
    """State is PRE / IN / POST / NOT_FOUND, like ha-teamtracker."""

    _attr_icon = "mdi:basketball"
    # Large, fast-changing attributes are kept out of the history database.
    _unrecorded_attributes = frozenset(
        {
            "play_by_play",
            "top_players",
            "game_stats",
            "quarter_scores",
            "shots",
            "previous_game",
            "next_game",
            "last_update",
        }
    )

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator, "game")

    @property
    def native_value(self) -> str | None:
        return self.coordinator.data.state if self.coordinator.data else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        if not data:
            return {}
        return {**data.game, "team_color": TEAM_COLORS.get(self.coordinator.team_code)}


class StandingsSensor(_Base):
    """State is the team's league position; the full table is an attribute."""

    _attr_icon = "mdi:format-list-numbered"
    _unrecorded_attributes = frozenset({"table"})

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator, "standings")

    @property
    def _row(self) -> dict[str, Any] | None:
        return _standings_row(self.coordinator.data, self.coordinator.team_code)

    @property
    def native_value(self) -> int | None:
        row = self._row
        return row["position"] if row else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        row = self._row or {}
        return {
            **self._common,
            "position_ordinal": ordinal(row.get("position")),
            "wins": row.get("wins"),
            "losses": row.get("losses"),
            "point_diff": row.get("point_diff"),
            "home_record": row.get("home_record"),
            "away_record": row.get("away_record"),
            "last10": row.get("last10"),
            "last5": row.get("last5"),
            "last5_order": "oldest_first",
            "zone": row.get("zone"),
            "round": data.standings_round if data else None,
            "table": data.standings if data else [],
        }


class StatsSensor(_Base):
    """State is points per game; season averages and league ranks as attributes."""

    _attr_icon = "mdi:chart-bar"
    _attr_native_unit_of_measurement = "pts/game"
    _attr_suggested_display_precision = 1
    _unrecorded_attributes = frozenset({"per_game", "team_leader_ranks", "league_leaders"})

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator, "stats")

    @property
    def native_value(self) -> float | None:
        data = self.coordinator.data
        return data.team_stats.get("points") if data else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        if not data:
            return self._common
        return {
            **self._common,
            "per_game": data.team_stats,
            "team_leader_ranks": data.leaders.get("team", []),
            "league_leaders": data.leaders.get("league", {}),
        }


# ------------------------------------------------------------ smaller sensors


def _standings_row(data: TrackerData | None, code: str) -> dict[str, Any] | None:
    if not data:
        return None
    return next((r for r in data.standings if r["code"] == code), None)


def _in_game(data: TrackerData, key: str) -> Any:
    """A live or final game value; nothing before tip-off."""
    return data.game.get(key) if data.state in (STATE_IN, STATE_POST) else None


@dataclass(frozen=True, kw_only=True)
class TrackerSensorDescription(SensorEntityDescription):
    value_fn: Callable[[TrackerData, str], Any]
    picture_fn: Callable[[TrackerData], str | None] | None = None
    attrs_fn: Callable[[TrackerData, str], dict[str, Any]] | None = None


SIMPLE_SENSORS: tuple[TrackerSensorDescription, ...] = (
    TrackerSensorDescription(
        key="next_game",
        device_class=SensorDeviceClass.TIMESTAMP,
        icon="mdi:calendar-clock",
        value_fn=lambda d, _: d.next_game_start,
        attrs_fn=lambda d, _: (
            {
                "opponent": d.game.get("opponent_name"),
                "opponent_abbr": d.game.get("opponent_abbr"),
                "homeaway": d.game.get("team_homeaway"),
                "venue": d.game.get("venue"),
            }
            if d.state == STATE_PRE
            else {
                "opponent": (d.game.get("next_game") or {}).get("opponent_name"),
                "opponent_abbr": (d.game.get("next_game") or {}).get("opponent_abbr"),
                "homeaway": (d.game.get("next_game") or {}).get("homeaway"),
                "venue": (d.game.get("next_game") or {}).get("venue"),
            }
        ),
    ),
    TrackerSensorDescription(
        key="game_status",
        device_class=SensorDeviceClass.ENUM,
        options=list(GAME_STATUS.values()),
        icon="mdi:scoreboard",
        value_fn=lambda d, _: GAME_STATUS.get(d.state),
    ),
    TrackerSensorDescription(
        key="team_score",
        icon="mdi:numeric",
        value_fn=lambda d, _: _in_game(d, "team_score"),
        picture_fn=lambda d: d.game.get("team_logo"),
    ),
    TrackerSensorDescription(
        key="opponent_score",
        icon="mdi:numeric",
        value_fn=lambda d, _: _in_game(d, "opponent_score"),
        picture_fn=lambda d: d.game.get("opponent_logo"),
    ),
    TrackerSensorDescription(
        key="opponent",
        icon="mdi:account-group",
        value_fn=lambda d, _: d.game.get("opponent_name"),
        picture_fn=lambda d: d.game.get("opponent_logo"),
        attrs_fn=lambda d, _: {
            "opponent_abbr": d.game.get("opponent_abbr"),
            "homeaway": d.game.get("opponent_homeaway"),
            "record": d.game.get("opponent_record"),
            "position": d.game.get("opponent_position"),
        },
    ),
    TrackerSensorDescription(
        key="last_result",
        icon="mdi:history",
        entity_registry_enabled_default=False,
        value_fn=lambda d, _: d.last_result,
    ),
    TrackerSensorDescription(
        key="record",
        icon="mdi:counter",
        entity_registry_enabled_default=False,
        value_fn=lambda d, code: (
            f"{row['wins']}-{row['losses']}" if (row := _standings_row(d, code)) else None
        ),
    ),
    TrackerSensorDescription(
        key="streak",
        icon="mdi:fire",
        entity_registry_enabled_default=False,
        value_fn=lambda d, _: d.streak,
    ),
    TrackerSensorDescription(
        key="point_diff",
        icon="mdi:plus-minus-variant",
        entity_registry_enabled_default=False,
        value_fn=lambda d, code: (row or {}).get("point_diff") if (row := _standings_row(d, code)) else None,
    ),
    TrackerSensorDescription(
        key="games_behind_playoffs",
        icon="mdi:trophy-outline",
        entity_registry_enabled_default=False,
        suggested_display_precision=1,
        value_fn=lambda d, _: d.games_behind_playoffs,
        attrs_fn=lambda d, _: {"games_behind_play_in": d.games_behind_play_in},
    ),
)


class SimpleSensor(_Base):
    entity_description: TrackerSensorDescription

    def __init__(self, coordinator: EuroLeagueCoordinator, description: TrackerSensorDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        data = self.coordinator.data
        return self.entity_description.value_fn(data, self.coordinator.team_code) if data else None

    @property
    def entity_picture(self) -> str | None:
        fn = self.entity_description.picture_fn
        data = self.coordinator.data
        return fn(data) if fn and data else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attrs_fn
        data = self.coordinator.data
        return fn(data, self.coordinator.team_code) if fn and data else None
