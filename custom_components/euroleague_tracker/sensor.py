"""Sensors: game (teamtracker-compatible), standings and season stats."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

try:  # Home Assistant 2025.2+
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
except ImportError:  # 2025.1
    from homeassistant.helpers.entity_platform import (
        AddEntitiesCallback as AddConfigEntryEntitiesCallback,
    )

from .const import ATTRIBUTION, COMPETITIONS, CONF_TEAM_NAME, DOMAIN, NAME, TEAM_COLORS
from .coordinator import EuroLeagueConfigEntry, EuroLeagueCoordinator
from .parser import ordinal


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
        ]
    )


class _Base(CoordinatorEntity[EuroLeagueCoordinator], SensorEntity):
    _attr_has_entity_name = True
    _attr_attribution = ATTRIBUTION

    def __init__(self, coordinator: EuroLeagueCoordinator, key: str) -> None:
        super().__init__(coordinator)
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_translation_key = key
        team = entry.data.get(CONF_TEAM_NAME, coordinator.team_code)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.unique_id or entry.entry_id)},
            name=f"{team} ({COMPETITIONS.get(coordinator.competition, coordinator.competition)})",
            manufacturer=NAME,
            model=coordinator.team_code,
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://www.euroleaguebasketball.net/",
        )

    @property
    def _common(self) -> dict[str, Any]:
        return {
            "team_abbr": self.coordinator.team_code,
            "team_color": TEAM_COLORS.get(self.coordinator.team_code),
            "competition": COMPETITIONS.get(self.coordinator.competition),
            "season": self.coordinator.data.season if self.coordinator.data else None,
        }


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
        data = self.coordinator.data
        if not data:
            return None
        return next((r for r in data.standings if r["code"] == self.coordinator.team_code), None)

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
