"""Config and options flow tests."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
    CONF_FETCH_LEADERS,
    CONF_LIVE_INTERVAL,
    CONF_POST_GAME_HOURS,
    CONF_TEAM_CODE,
    DOMAIN,
)

from .conftest import mock_api


async def _start(hass):
    return await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})


async def test_full_flow(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    result = await _start(hass)
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_COMPETITION: "E"})
    assert result["step_id"] == "team"
    options = result["data_schema"].schema[CONF_TEAM_CODE].config["options"]
    assert {"value": "OLY", "label": "Olympiacos Piraeus"} in options
    assert len(options) == 20

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_TEAM_CODE: "OLY"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Olympiacos Piraeus (EuroLeague)"
    assert result["data"][CONF_TEAM_CODE] == "OLY"
    await hass.async_block_till_done()


async def test_duplicate_aborts(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    MockConfigEntry(domain=DOMAIN, unique_id="E_OLY", data={CONF_TEAM_CODE: "OLY"}).add_to_hass(hass)
    result = await _start(hass)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_COMPETITION: "E"})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_TEAM_CODE: "OLY"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_cannot_connect(hass: HomeAssistant, aioclient_mock):
    aioclient_mock.get("https://api-live.euroleague.net/v2/competitions/E/seasons", status=503)
    result = await _start(hass)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_COMPETITION: "E"})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}


async def test_options_flow(hass: HomeAssistant, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    entry = MockConfigEntry(
        domain=DOMAIN, unique_id="E_OLY", data={CONF_COMPETITION: "E", CONF_TEAM_CODE: "OLY"}
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["step_id"] == "init"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {CONF_LIVE_INTERVAL: 10, CONF_POST_GAME_HOURS: 12, CONF_FETCH_LEADERS: False},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options[CONF_LIVE_INTERVAL] == 10
    assert entry.runtime_data.fetch_leaders is False
