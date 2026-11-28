"""Binary sensor: on while the team's game is live."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import STATE_IN
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
    async_add_entities([LiveSensor(entry.runtime_data)])


class LiveSensor(EuroLeagueEntityMixin, CoordinatorEntity[EuroLeagueCoordinator], BinarySensorEntity):
    _attr_icon = "mdi:broadcast"

    def __init__(self, coordinator: EuroLeagueCoordinator) -> None:
        super().__init__(coordinator)
        self._setup_identity(coordinator, "live")

    @property
    def is_on(self) -> bool | None:
        data = self.coordinator.data
        return data.state == STATE_IN if data else None
