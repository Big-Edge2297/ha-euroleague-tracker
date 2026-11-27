"""EuroLeague Tracker: follow a EuroLeague / EuroCup team in Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .api import EuroLeagueApi
from .const import CARD_FILENAME, CONF_COMPETITION, DOMAIN, FRONTEND_URL_BASE
from .coordinator import EuroLeagueConfigEntry, EuroLeagueCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR, Platform.EVENT]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the bundled card and load it on every dashboard."""
    await _register_card(hass)
    return True


async def _register_card(hass: HomeAssistant) -> None:
    card = Path(__file__).parent / "frontend" / CARD_FILENAME
    if not card.is_file():
        _LOGGER.warning("Card file %s is missing; the dashboard card won't load", card)
        return
    integration = await async_get_integration(hass, DOMAIN)
    url = f"{FRONTEND_URL_BASE}/{CARD_FILENAME}"
    await hass.http.async_register_static_paths([StaticPathConfig(url, str(card), cache_headers=True)])
    # The version query string makes browsers fetch the new card after updates.
    add_extra_js_url(hass, f"{url}?v={integration.version}")


async def async_setup_entry(hass: HomeAssistant, entry: EuroLeagueConfigEntry) -> bool:
    api = EuroLeagueApi(async_get_clientsession(hass), entry.data.get(CONF_COMPETITION, "E"))
    coordinator = EuroLeagueCoordinator(hass, entry, api)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    entry.async_on_unload(coordinator.async_cancel_pending)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: EuroLeagueConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_reload(hass: HomeAssistant, entry: EuroLeagueConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
