"""Calendar: every game of the team's season."""

from __future__ import annotations

from datetime import datetime

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .coordinator import EuroLeagueConfigEntry, EuroLeagueCoordinator
from .entity import EuroLeagueEntityMixin

try:  # Home Assistant 2025.2+
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
except ImportError:  # 2025.1
    from homeassistant.helpers.entity_platform import (
        AddEntitiesCallback as AddConfigEntryEntitiesCallback,
    )


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EuroLeagueConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([GamesCalendar(entry.runtime_data)])


def _event(item: dict) -> CalendarEvent:
    return CalendarEvent(
        start=item["start"],
        end=item["end"],
        summary=item["summary"],
        description=item.get("description"),
        location=item.get("location"),
        uid=item.get("uid"),
    )


class GamesCalendar(EuroLeagueEntityMixin, CoordinatorEntity[EuroLeagueCoordinator], CalendarEntity):
    """The season's games, played and to come, with results in the description."""

    _attr_icon = "mdi:calendar-star"

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator)
        self._setup_identity(coordinator, "games")

    @property
    def _items(self) -> list[dict]:
        return self.coordinator.data.calendar if self.coordinator.data else []

    @property
    def event(self) -> CalendarEvent | None:
        """The game being played now, else the next one."""
        now = dt_util.utcnow()
        item = next((i for i in self._items if i["end"] > now), None)
        return _event(item) if item else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        return [_event(i) for i in self._items if i["end"] > start_date and i["start"] < end_date]
