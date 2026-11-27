"""Diagnostics download (Settings → Devices & services → … → Download diagnostics)."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistant

from .coordinator import EuroLeagueConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: EuroLeagueConfigEntry
) -> dict[str, Any]:
    coordinator = entry.runtime_data
    data = coordinator.data
    return {
        "entry": {"data": dict(entry.data), "options": dict(entry.options)},
        "update_interval_seconds": coordinator.update_interval.total_seconds()
        if coordinator.update_interval
        else None,
        "last_update_success": coordinator.last_update_success,
        "data": asdict(data) if data else None,
    }
