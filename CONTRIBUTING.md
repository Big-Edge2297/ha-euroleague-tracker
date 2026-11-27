# Contributing

Thanks for helping! Bug reports, feature ideas and pull requests are all welcome.

## Project layout

| Path | What's there |
|---|---|
| `custom_components/euroleague_tracker/api.py` | The only code that talks to EuroLeague's servers. |
| `custom_components/euroleague_tracker/parser.py` | Pure functions turning API responses into sensor data. No Home Assistant imports, easy to test. |
| `custom_components/euroleague_tracker/coordinator.py` | What to fetch and how often; fires `euroleague_tracker_event`. |
| `src/` | The card (TypeScript + Lit). `npm run build` writes it to `custom_components/euroleague_tracker/frontend/`. |
| `test/` | Card tests (`npm test`): Node's test runner with jsdom, bundled by esbuild. |
| `tests/` | Integration tests (`pytest`), run against the oldest supported Home Assistant and the newest. |
| `tests/fixtures/` | Trimmed real API responses (same field names and formats). |
| `scripts/harness/demo-states.json` | Sensor states the parser makes from the fixtures. The card tests and the screenshots use it; `tests/test_demo_states.py` keeps it in step with the parser. |
| `scripts/` | Card build and test runners, the demo-state builder, the screenshot generator and `render_brand.py` (icon, logo and README banner from `docs/brand/icon.svg`). |

## Local setup

```bash
npm ci
npm run build
npm test
python -m venv .venv && . .venv/bin/activate
pip install -r requirements_test.txt
pip install "$(python scripts/frontend_requirement.py)"
pytest
ruff check . && ruff format --check .
```

Commit the rebuilt `custom_components/euroleague_tracker/frontend/euroleague-tracker-card.js` along with any change under `src/`; CI checks it's up to date. If you change the parser or the fixtures, also run `python scripts/make_demo_states.py` and commit `scripts/harness/demo-states.json`.

## Checks on every push

| Workflow | What it checks |
|---|---|
| Tests | Ruff; the integration tests on Home Assistant 2025.1 (Python 3.12) and the newest (Python 3.14); the card's typecheck, tests and build |
| Validate | HACS validation and hassfest (also daily) |
| Dependency audit | Fails if a library bundled into the card has a known vulnerability; build tools are only reported (also every Monday) |
| Screenshots | Regenerates the card screenshots in `docs/images/` when the card or the fixtures change |
| Release | Attaches `euroleague_tracker.zip` to each published release |

Dependabot opens grouped update pull requests every Monday for npm packages and GitHub Actions. `@types/node` stays on the major that matches the workflows' Node version (26).

## Releasing

1. Bump `version` in `custom_components/euroleague_tracker/manifest.json` (for example `0.2.0`).
2. Add a section for it at the top of `CHANGELOG.md`.
3. Update `README.md` for anything people see: new entities, options, card settings, events and automation examples.
4. Push to `main` and wait for the checks to pass.
5. On GitHub, **Releases → Draft a new release**: tag `v0.2.0` (with the `v`), title `v0.2.0`, paste the changelog section as the notes, and publish.
6. The **Release** workflow checks that the tag matches `manifest.json`, builds `euroleague_tracker.zip` and attaches it to the release. HACS installs that zip, and its downloads are what the download badges count.

If a release was published without the zip, run the **Release** workflow by hand from the Actions tab and give it the tag.

## Recording new fixtures

When the API changes shape, capture fresh responses (browser devtools on euroleaguebasketball.net works well), trim them to a handful of entries, keep the field names exactly as returned and add them under `tests/fixtures/`.
