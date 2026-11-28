"""The automation blueprints are valid and turn into working automations."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.automation.config import (
    AUTOMATION_BLUEPRINT_SCHEMA,
    async_validate_config_item,
)
from homeassistant.components.blueprint import models
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from homeassistant.util.yaml import load_yaml
import pytest

FOLDER = Path(__file__).parent.parent / "blueprints" / "automation" / "euroleague_tracker"

INPUTS = {
    "score_lights.yaml": {
        "scored": "event.olympiacos_piraeus_euroleague_team_scored",
        "lights": {"entity_id": "light.living_room"},
    },
    "final_score.yaml": {
        "game_events": "event.olympiacos_piraeus_euroleague_game_events",
        "phone": "abc123",
    },
    "tipoff_reminder.yaml": {
        "next_game": "sensor.olympiacos_piraeus_euroleague_next_game",
        "phone": "abc123",
    },
}


def test_every_blueprint_is_tested():
    assert sorted(p.name for p in FOLDER.glob("*.yaml")) == sorted(INPUTS)


@pytest.mark.parametrize("name", sorted(INPUTS))
async def test_blueprint_validates_and_substitutes(hass: HomeAssistant, name: str):
    await async_setup_component(hass, "homeassistant", {})
    blueprint = models.Blueprint(
        load_yaml(FOLDER / name), expected_domain="automation", schema=AUTOMATION_BLUEPRINT_SCHEMA
    )
    meta = blueprint.metadata
    assert meta["source_url"].endswith(f"/blueprints/automation/euroleague_tracker/{name}")
    assert meta["name"].startswith("EuroLeague Tracker")
    inputs = models.BlueprintInputs(blueprint, {"use_blueprint": {"path": name, "input": INPUTS[name]}})
    inputs.validate()
    config = inputs.async_substitute()
    config.pop("use_blueprint", None)
    # The phone step is a mobile_app device action, which needs a real phone;
    # check the same title and message templates through notify.notify instead.
    for i, step in enumerate(config.get("actions", [])):
        if step.get("domain") == "mobile_app":
            assert step["device_id"] == "abc123" and step["type"] == "notify"
            data = {"title": step["title"], "message": step["message"]}
            config["actions"][i] = {"action": "notify.notify", "data": data}
    validated = await async_validate_config_item(hass, f"test_{name}", config)
    assert validated is not None
    assert getattr(validated, "validation_error", None) is None


async def test_score_lights_flashes_on_threes_only(hass: HomeAssistant):
    from pytest_homeassistant_custom_component.common import async_mock_service

    blueprint = models.Blueprint(
        load_yaml(FOLDER / "score_lights.yaml"),
        expected_domain="automation",
        schema=AUTOMATION_BLUEPRINT_SCHEMA,
    )
    config = models.BlueprintInputs(
        blueprint, {"use_blueprint": {"path": "x", "input": INPUTS["score_lights.yaml"]}}
    ).async_substitute()
    config.pop("use_blueprint", None)
    calls = async_mock_service(hass, "light", "turn_on")
    entity = INPUTS["score_lights.yaml"]["scored"]
    hass.states.async_set(entity, "unknown", {"event_type": None})
    assert await async_setup_component(hass, "automation", {"automation": [config]})
    await hass.async_block_till_done()

    hass.states.async_set(entity, "2026-12-04T19:20:00+00:00", {"event_type": "two_pointer"})
    await hass.async_block_till_done()
    assert calls == []
    hass.states.async_set(entity, "2026-12-04T19:21:00+00:00", {"event_type": "three_pointer"})
    await hass.async_block_till_done()
    assert len(calls) == 1
    assert calls[0].data == {"entity_id": ["light.living_room"], "rgb_color": [198, 40, 40], "flash": "short"}
