"""Event entities: every basket, and the main moments of a game.

They fire after the "delay live events" option, so automations can line up
with a TV or stream that runs behind the live data.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.event import EventEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .coordinator import EuroLeagueConfigEntry, EuroLeagueCoordinator, signal_game_event, signal_scored
from .entity import EuroLeagueEntityMixin

try:  # Home Assistant 2025.2+
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
except ImportError:  # 2025.1
    from homeassistant.helpers.entity_platform import (
        AddEntitiesCallback as AddConfigEntryEntitiesCallback,
    )

SHOT_TYPES = ["free_throw", "two_pointer", "three_pointer"]
GAME_EVENT_TYPES = ["game_started", "quarter_end", "lead_change", "game_final"]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EuroLeagueConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(
        [
            ScoredEvent(coordinator, "team"),
            ScoredEvent(coordinator, "opponent"),
            GameEvent(coordinator),
        ]
    )


class _Base(EuroLeagueEntityMixin, EventEntity):
    def __init__(self, coordinator: EuroLeagueCoordinator, key: str) -> None:
        self.coordinator = coordinator
        self._setup_identity(coordinator, key)


class ScoredEvent(_Base):
    """Fires once per basket by one side: free throw, two- or three-pointer."""

    _attr_event_types = SHOT_TYPES

    def __init__(self, coordinator: EuroLeagueCoordinator, side: str) -> None:
        super().__init__(coordinator, f"{side}_scored")
        self._side = side
        self._attr_icon = "mdi:basketball-hoop" if side == "team" else "mdi:basketball-hoop-outline"

    async def async_added_to_hass(self) -> None:
        signal = signal_scored(self.coordinator.config_entry.entry_id)
        self.async_on_remove(async_dispatcher_connect(self.hass, signal, self._scored))

    @callback
    def _scored(self, side: str, shot: str, data: dict[str, Any]) -> None:
        if side != self._side:
            return
        self._trigger_event(shot, _attributes(data))
        self.async_write_ha_state()


class GameEvent(_Base):
    """Tip-off, end of a quarter, a lead change and the final buzzer."""

    _attr_event_types = GAME_EVENT_TYPES
    _attr_icon = "mdi:whistle"

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator, "game_events")

    async def async_added_to_hass(self) -> None:
        signal = signal_game_event(self.coordinator.config_entry.entry_id)
        self.async_on_remove(async_dispatcher_connect(self.hass, signal, self._event))

    @callback
    def _event(self, kind: str, data: dict[str, Any]) -> None:
        self._trigger_event(kind, _attributes(data))
        self.async_write_ha_state()


def _attributes(data: dict[str, Any]) -> dict[str, Any]:
    """Event attributes without the internal entry id."""
    return {k: v for k, v in data.items() if k != "entry_id"}
