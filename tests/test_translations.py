"""Every text the integration shows must exist in translations/en.json."""

from __future__ import annotations

import json
from pathlib import Path

from custom_components.euroleague_tracker.const import (
    CONF_COMPETITION,
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
        CONF_FETCH_LEADERS,
    }


def test_entity_names_and_game_states():
    sensors = EN["entity"]["sensor"]
    assert set(sensors) == {"game", "standings", "stats"}
    assert set(sensors["game"]["state"]) == {STATE_PRE, STATE_IN, STATE_POST, STATE_NOT_FOUND}


def test_every_translation_key_in_the_code_exists():
    code = "\n".join(p.read_text() for p in ROOT.glob("*.py"))
    assert 'translation_key="api_access_refused"' in code
    assert "api_access_refused" in EN["issues"]
    for key in ("cannot_connect", "no_teams"):
        assert f'"{key}"' in code, key
