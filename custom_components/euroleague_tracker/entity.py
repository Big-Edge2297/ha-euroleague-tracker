"""Shared base for EuroLeague Tracker entities."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import ATTRIBUTION, COMPETITIONS, CONF_TEAM_NAME, DOMAIN, NAME
from .coordinator import EuroLeagueCoordinator


def device_info(coordinator: EuroLeagueCoordinator) -> DeviceInfo:
    entry = coordinator.config_entry
    team = entry.data.get(CONF_TEAM_NAME, coordinator.team_code)
    competition = COMPETITIONS.get(coordinator.competition, coordinator.competition)
    return DeviceInfo(
        identifiers={(DOMAIN, entry.unique_id or entry.entry_id)},
        name=f"{team} ({competition})",
        manufacturer=NAME,
        model=coordinator.team_code,
        entry_type=DeviceEntryType.SERVICE,
        configuration_url="https://www.euroleaguebasketball.net/",
    )


class EuroLeagueEntityMixin(Entity):
    """Name, unique id and device shared by every entity of one followed team."""

    _attr_has_entity_name = True
    _attr_attribution = ATTRIBUTION

    def _setup_identity(self, coordinator: EuroLeagueCoordinator, key: str) -> None:
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = device_info(coordinator)
