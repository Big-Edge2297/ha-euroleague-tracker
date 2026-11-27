"""The card tests and screenshots use scripts/harness/demo-states.json.

It must be exactly what the parser makes from the fixtures, so the card is
tested against what the sensors really produce.
"""

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def test_demo_states_are_up_to_date(tmp_path):
    out = tmp_path / "demo-states.json"
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "make_demo_states.py"), str(out)],
        check=True,
        capture_output=True,
    )
    committed = json.loads((ROOT / "scripts" / "harness" / "demo-states.json").read_text())
    assert json.loads(out.read_text()) == committed, (
        "Run `python scripts/make_demo_states.py` and commit scripts/harness/demo-states.json"
    )
