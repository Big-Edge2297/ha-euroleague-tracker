"""Every text the integration shows must exist in translations/en.json."""

from __future__ import annotations

import json
from pathlib import Path

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
    CONF_EVENT_DELAY,
    CONF_FETCH_LEADERS,
    CONF_LIVE_INTERVAL,
    CONF_POST_GAME_HOURS,
    CONF_TEAM_CODE,
    STATE_IN,
    STATE_NOT_FOUND,
    STATE_POST,
    STATE_PRE,
)

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "euroleague_tracker"
EN = json.loads((ROOT / "translations" / "en.json").read_text(encoding="utf-8"))


def strings(node, prefix=()):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from strings(value, (*prefix, key))
    else:
        yield prefix, node


def test_no_empty_or_padded_strings():
    for path, text in strings(EN):
        assert isinstance(text, str) and text and text == text.strip(), ".".join(path)


def test_config_flow_steps_and_fields():
    steps = EN["config"]["step"]
    assert set(steps["user"]["data"]) == {CONF_COMPETITION}
    assert set(steps["team"]["data"]) == {CONF_TEAM_CODE}
    assert set(EN["config"]["error"]) == {"cannot_connect", "no_teams"}
    assert "already_configured" in EN["config"]["abort"]


def test_options_fields():
    assert set(EN["options"]["step"]["init"]["data"]) == {
        CONF_LIVE_INTERVAL,
        CONF_POST_GAME_HOURS,
        CONF_EVENT_DELAY,
        CONF_FETCH_LEADERS,
    }


def test_entity_names():
    from custom_components.euroleague_tracker.event import GAME_EVENT_TYPES, SHOT_TYPES
    from custom_components.euroleague_tracker.sensor import GAME_STATUS, SIMPLE_SENSORS

    sensors = EN["entity"]["sensor"]
    assert set(sensors) == {"game", "standings", "stats"} | {d.key for d in SIMPLE_SENSORS}
    assert all(sensors[key]["name"] for key in sensors)
    assert set(sensors["game_status"]["state"]) == set(GAME_STATUS.values())
    assert set(EN["entity"]["binary_sensor"]) == {"live"}
    events = EN["entity"]["event"]
    assert set(events) == {"team_scored", "opponent_scored", "game_events"}
    for key in ("team_scored", "opponent_scored"):
        assert set(events[key]["state_attributes"]["event_type"]["state"]) == set(SHOT_TYPES)
    assert set(events["game_events"]["state_attributes"]["event_type"]["state"]) == set(GAME_EVENT_TYPES)


def test_game_states_stay_untranslated():
    """The states are uppercase for ha-teamtracker compatibility, and translation
    keys must be lowercase (hassfest), so the game states have no translations."""
    assert "state" not in EN["entity"]["sensor"]["game"]
    assert all(s.isupper() for s in (STATE_PRE, STATE_IN, STATE_POST, STATE_NOT_FOUND))


def test_every_translation_key_in_the_code_exists():
    code = "\n".join(p.read_text() for p in ROOT.glob("*.py"))
    assert 'translation_key="api_access_refused"' in code
    assert "api_access_refused" in EN["issues"]
    for key in ("cannot_connect", "no_teams"):
        assert f'"{key}"' in code, key


def test_translation_keys_follow_hassfest_rules():
    """hassfest: keys are [a-z0-9-_]+ and don't start or end with - or _."""
    import re

    pattern = re.compile(r"^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$")

    def keys(node, prefix=()):
        if isinstance(node, dict):
            for key, value in node.items():
                yield (*prefix, key)
                yield from keys(value, (*prefix, key))

    bad = [".".join(path) for path in keys(EN) if not pattern.match(path[-1])]
    assert not bad, bad
