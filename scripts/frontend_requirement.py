"""Print the home-assistant-frontend requirement of the installed Home Assistant."""

import importlib.resources
import json

manifest = json.loads(
    (importlib.resources.files("homeassistant") / "components/frontend/manifest.json").read_text()
)
print(next(r for r in manifest["requirements"] if r.startswith("home-assistant-frontend")))
