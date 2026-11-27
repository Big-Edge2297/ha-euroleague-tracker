"""Entity IDs documented in the README."""

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
    CONF_TEAM_CODE,
    CONF_TEAM_NAME,
    DOMAIN,
)

from .conftest import mock_api


async def test_entity_ids_match_readme(hass, aioclient_mock, freezer):
    freezer.move_to("2026-11-27T15:00:00+00:00")
    mock_api(aioclient_mock)
    entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id="E_OLY",
        title="Olympiacos Piraeus (EuroLeague)",
        data={CONF_COMPETITION: "E", CONF_TEAM_CODE: "OLY", CONF_TEAM_NAME: "Olympiacos Piraeus"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    for entity_id in (
        "sensor.olympiacos_piraeus_euroleague_game",
        "sensor.olympiacos_piraeus_euroleague_standings_position",
        "sensor.olympiacos_piraeus_euroleague_season_stats",
    ):
        assert hass.states.get(entity_id) is not None, entity_id
