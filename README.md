# **EuroLeague Tracker**

<p align="center">

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://hacs.xyz/docs/faq/custom_repositories/)
[![GitHub release](https://img.shields.io/github/v/release/Big-Edge2297/ha-euroleague-tracker?style=flat-square)](https://github.com/Big-Edge2297/ha-euroleague-tracker/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/Big-Edge2297/ha-euroleague-tracker/total?style=flat-square&label=downloads)](https://github.com/Big-Edge2297/ha-euroleague-tracker/releases)
[![Latest release downloads](https://img.shields.io/github/downloads/Big-Edge2297/ha-euroleague-tracker/latest/total?style=flat-square&label=latest%20release)](https://github.com/Big-Edge2297/ha-euroleague-tracker/releases/latest)
[![Validate](https://img.shields.io/github/actions/workflow/status/Big-Edge2297/ha-euroleague-tracker/validate.yml?branch=main&style=flat-square&label=validate)](https://github.com/Big-Edge2297/ha-euroleague-tracker/actions/workflows/validate.yml)

</p>

<p align="center">
  <img src="docs/images/banner.png" alt="EuroLeague Tracker: live scores, standings and stats for your team, in Home Assistant" width="100%">
</p>

Follow your **EuroLeague** or **EuroCup** basketball team in Home Assistant: live score and play-by-play, the next game with a countdown and head to head, the standings with the playoff race, the whole round's scoreboard, season stats ranked against the league, and the play-in, playoffs and Final Four as a bracket. The season's games also appear in your Home Assistant calendar. A dashboard card ships with the integration, with no separate install.

> [!NOTE]
> This is an unofficial project, not affiliated with or endorsed by Euroleague Basketball. It reads the same public data feeds as the EuroLeague website.

## Features

- **Game sensor**, compatible with [ha-teamtracker](https://github.com/vasqued2/ha-teamtracker): state `PRE`, `IN`, `POST` or `NOT_FOUND`, plus the attributes teamtracker uses. [ha-teamtracker-card](https://github.com/vasqued2/ha-teamtracker-card) works with it unchanged.
- **Live games**: score, quarter and clock, quarter-by-quarter scores, a score-flow chart, play-by-play, team fouls, top players by PIR.
- **Final result**: score flow with the biggest leads, top performers, a team comparison and the game's shot chart.
- **Next game**: tip-off in your time zone, countdown, both teams' league position, last 5, home/away record, last 10, point difference and the last meetings between the two teams.
- **Standings**: the full table, with your team's position as the sensor state, playoff/play-in zones and the playoff race: how many games clear of (or behind) the playoff and play-in lines, and when a place is clinched or out of reach.
- **Play-in, playoffs and Final Four**: proper round names ("Playoffs · Game 3"), the best-of-five series score, seeds, and the Final Four's neutral venue. Once the regular season ends, the Standings view becomes a bracket.
- **Calendar**: every game of the season in Home Assistant's calendar, with the results added as they come in.
- **Round scoreboard**: every game of the round, with arrows to the rounds before and after.
- **Season stats**: where your team ranks in the league for each stat, attack against defence, the season's form game by game, your players among the league leaders (with headshots), and the season's shooting by court zone.
- **An event for every basket**: *Team scored* and *Opponent scored* fire once per free throw, two- or three-pointer, with the player and the score, ready to flash your lights. A delay option lines them up with a TV stream that runs behind.
- **Game events** for tip-off, quarter ends, lead changes and the final buzzer.
- **Entities for everything you'd automate on**: next game (a timestamp), game status, live on/off, both scores, the opponent, plus last result, record, streak, point difference and games behind the playoffs.
- **Bundled cards**: the full card with four themes (follow Home Assistant, dark, light, team colours) and a visual editor, and a compact one-line card for sections dashboards.
- **Blueprints** you can import in one click: flash the lights when your team scores, a final-score notification and a tip-off reminder.
- **Adaptive polling**: every 15 minutes between games, every minute before tip-off, every 15 seconds during a game (adjustable).
- Follow several teams, in EuroLeague and EuroCup, by adding the integration once per team.

## Installation

### HACS (recommended)

The integration is waiting to join the HACS default list. Until then, add it as a custom repository:

[![Open your Home Assistant instance and open this repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Big-Edge2297&repository=ha-euroleague-tracker&category=integration)

Or by hand:

1. In Home Assistant open **HACS**, then the **⋮** menu → **Custom repositories**.
2. Add `https://github.com/Big-Edge2297/ha-euroleague-tracker` with type **Integration**.
3. Search for **EuroLeague Tracker**, open it and click **Download**.
4. Restart Home Assistant.

### Manual

1. Download `euroleague_tracker.zip` from the [latest release](https://github.com/Big-Edge2297/ha-euroleague-tracker/releases/latest).
2. Unzip it into `config/custom_components/euroleague_tracker/`.
3. Restart Home Assistant.

## Setup

[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=euroleague_tracker)

1. **Settings → Devices & services → Add integration → EuroLeague Tracker**.
2. Choose **EuroLeague** or **EuroCup**.
3. Pick your team.

The card registers itself, so you can add it straight away: edit a dashboard → **Add card** → **EuroLeague Tracker**.

### Options

Open the integration and click **Configure**:

| Option | Default | What it does |
|---|---|---|
| Update interval during live games | 15 s | How often the score refreshes while a game is on (5–120 s). |
| Keep showing the final result for | 24 h | How long the game sensor stays on `POST` before switching to the next game. |
| Delay live events by | 0 s | Holds baskets, lead changes and other live events back, so lights and notifications match a TV or stream that runs behind the live data. Usually 20–60 s. |
| Fetch league leaders | on | League leader rankings (a larger download, refreshed twice a day). |

## Entities

Each team adds a device. For Olympiacos in the EuroLeague (entity ids start with `olympiacos_piraeus_euroleague_`):

| Entity | Example state | Notes |
|---|---|---|
| `event.…_team_scored` | `three_pointer` | Fires once per basket: `free_throw`, `two_pointer` or `three_pointer`, with `player`, `points`, `team_score`, `opponent_score`, `quarter`, `clock` |
| `event.…_opponent_scored` | `two_pointer` | The same for the other team |
| `event.…_game_events` | `lead_change` | `game_started`, `quarter_end`, `lead_change`, `game_final` (with `won`) |
| `sensor.…_game` | `PRE` / `IN` / `POST` / `NOT_FOUND` | teamtracker-compatible; every game detail as attributes |
| `sensor.…_game_status` | Upcoming / Live / Final / No game | The same state, readable and translated |
| `binary_sensor.…_live` | on | On while the game is being played |
| `sensor.…_next_game` | 4 Dec, 21:15 | A timestamp: use it in time triggers |
| `sensor.…_team_score`, `sensor.…_opponent_score` | 63, 58 | During and after a game |
| `sensor.…_opponent` | LDLC ASVEL | With the opponent's crest as its picture |
| `calendar.…_games` | on during a game | Every game of the season; results in the description |
| `sensor.…_standings_position` | 1 | The full table, the playoff race, the round scoreboard and, in the postseason, the bracket |
| `sensor.…_season_stats` | 90.4 pts/game | Per-game averages, league ranks, attack and defence, form, shot zones and league leader ranks |
| `sensor.…_last_result` * | W 104-79 vs HTA | |
| `sensor.…_record` * | 11-3 | |
| `sensor.…_streak` * | W4 | |
| `sensor.…_point_difference` * | +116 | |
| `sensor.…_games_behind_playoffs` * | 0 | Games behind 6th; `games_behind_play_in` (10th) as an attribute |

\* Disabled at first, to keep your entity list short: enable them from the integration's entity list.

<details>
<summary>All game sensor attributes</summary>

**teamtracker-compatible:** `sport`, `league`, `event_name`, `date`, `kickoff_in`, `venue`, `location`, `team_abbr`, `team_id`, `team_name`, `team_record`, `team_homeaway`, `team_logo`, `team_colors`, `team_score`, `team_winner`, `team_timeouts`, the same `opponent_*` set, `quarter`, `clock`, `last_play`, `last_update`, `api_message`.

**EuroLeague extras:** `competition`, `season`, `round`, `round_name`, `phase`, `game_code`, `team_position`, `opponent_position`, `team_form`, `opponent_form` (last 5, oldest first), `team_fouls`, `opponent_fouls`, `attendance`, `capacity`, `quarter_scores`, `top_players`, `game_stats`, `play_by_play`, `shots`, `score_flow` (the score after every minute, with the biggest leads), `head_to_head` (the last five meetings with this opponent, from this season and the two before), `phase_code` (`RS`, `PI`, `PO` or `FF`), `series` (the best-of-five score, game number and every game of the series), `team_seed`, `opponent_seed`, `neutral_site`, `coach`, `previous_game`, `next_game`, `team_color`.

**Season stats sensor:** `per_game`, `league_ranks` (value, rank, league worst, best and average for points, rebounds, assists, steals, turnovers, blocks, PIR, 2P%, 3P% and FT%), `attack_defence` (points scored and allowed per game, with ranks and the league average), `form` (every game's margin), `shot_zones` (made and attempted at the rim, in the paint, mid-range, corner threes and above-the-break threes), `team_leader_ranks`, `league_leaders`.

**Standings sensor:** `table`; `scoreboard`: every game of the current round and the rounds either side, with the clubs' crests; `playoff_race`: for the playoff (6th) and play-in (10th) lines, whether the team is inside, how many games clear or behind, the rival on the other side of the line and `clinched` / `eliminated` once it is certain; `bracket`: the play-in, the four playoff series and the Final Four, from the moment they are on the schedule.

The bulky attributes (`play_by_play`, `top_players`, `game_stats`, `quarter_scores`, `shots`, `score_flow`, `head_to_head`, `series`, the standings `table`, `scoreboard`, `playoff_race` and `bracket`, and the season stats lists) are left out of the recorder so they don't fill your database.

</details>

<details>
<summary>How the season stats are worked out</summary>

- **League ranks** come from EuroLeague's per-game averages for every club. Rank 1 is the best; for turnovers that means the fewest.
- **Attack and defence** are worked out from every game played this season, so overtime counts (the standings leave it out).
- **Clinched and eliminated** are worked out from wins alone, counting every tie against your team, so they never appear too early.
- **Shot zones** add up the shot locations from each of your team's finished games. Each game is read once, ten at a time a minute apart, and saved, so after the first start the zones are complete within a few minutes and a restart doesn't read them again. While they fill in, the card says how many games are in so far ("10 of 14 games"). They are not read during a live game.

</details>

## The card

Add it from the card picker, or in YAML:

```yaml
type: custom:euroleague-tracker-card
entity: sensor.olympiacos_piraeus_euroleague_game
```

| Option | Default | Description |
|---|---|---|
| `entity` | required | The game sensor. |
| `view` | `tabs` | `tabs` (Game, Standings, Stats, Round), or just one of `game`, `standings`, `stats`, `round`. |
| `theme` | `auto` | `auto` follows your Home Assistant theme; also `dark`, `light`, `team`. |
| `team_color` | club colour | Any hex colour, used for accents and for the `team` theme background. |
| `play_by_play_rows` | `4` | Plays shown during a live game (0 hides them). |
| `standings_rows` | all | Show fewer rows, centred on your team. |
| `show_shot_chart` | `true` | The game's shot chart under the final result. |
| `show_round_tab` | `true` | The Round tab with the round's scoreboard. |
| `standings_entity`, `stats_entity` | found automatically | Only needed if you renamed the sensors. |

### Compact card

One row for a sections dashboard: the next game, the live score with the latest play, or the result (with the series score in the playoffs). Tap it for the game's details. Pick **EuroLeague Tracker (compact)** in the card picker, or:

```yaml
type: custom:euroleague-tracker-compact-card
entity: sensor.olympiacos_piraeus_euroleague_game
```

It takes `entity`, `theme` and `team_color`.

### Themes

| | Dark | Light | Team colours |
|---|---|---|---|
| Next game | ![](docs/images/next-game-dark.png) | ![](docs/images/next-game-light.png) | ![](docs/images/next-game-team.png) |
| Live | ![](docs/images/live-dark.png) | ![](docs/images/live-light.png) | ![](docs/images/live-team.png) |
| Final | ![](docs/images/final-dark.png) | ![](docs/images/final-light.png) | ![](docs/images/final-team.png) |
| Standings | ![](docs/images/standings-dark.png) | ![](docs/images/standings-light.png) | ![](docs/images/standings-team.png) |
| Stats · Team | ![](docs/images/stats-dark.png) | ![](docs/images/stats-light.png) | ![](docs/images/stats-team.png) |
| Stats · Players | ![](docs/images/stats-players-dark.png) | ![](docs/images/stats-players-light.png) | ![](docs/images/stats-players-team.png) |
| Stats · Shots | ![](docs/images/stats-shots-dark.png) | ![](docs/images/stats-shots-light.png) | ![](docs/images/stats-shots-team.png) |
| Round | ![](docs/images/round-dark.png) | ![](docs/images/round-light.png) | ![](docs/images/round-team.png) |
| Playoff game | ![](docs/images/playoff-game-dark.png) | ![](docs/images/playoff-game-light.png) | ![](docs/images/playoff-game-team.png) |
| Final Four | ![](docs/images/final-four-dark.png) | ![](docs/images/final-four-light.png) | ![](docs/images/final-four-team.png) |
| Bracket | ![](docs/images/bracket-dark.png) | ![](docs/images/bracket-light.png) | ![](docs/images/bracket-team.png) |
| Compact | ![](docs/images/compact-dark.png) | ![](docs/images/compact-light.png) | ![](docs/images/compact-team.png) |

The playoff screenshots use the real 2025-26 postseason. These screenshots are generated automatically from real EuroLeague data every time the card changes (see [Development](#development)).

## Automations

### Blueprints

Import one, pick your entities and you're done:

| Blueprint | What it does | |
|---|---|---|
| Flash the lights when your team scores | Flashes lights in a colour you pick, on threes only or any basket | [![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FBig-Edge2297%2Fha-euroleague-tracker%2Fblob%2Fmain%2Fblueprints%2Fautomation%2Feuroleague_tracker%2Fscore_lights.yaml) |
| Final score notification | Sends the result to your phone at the final buzzer | [![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FBig-Edge2297%2Fha-euroleague-tracker%2Fblob%2Fmain%2Fblueprints%2Fautomation%2Feuroleague_tracker%2Ffinal_score.yaml) |
| Tip-off reminder | A notification a set time before the next game | [![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2FBig-Edge2297%2Fha-euroleague-tracker%2Fblob%2Fmain%2Fblueprints%2Fautomation%2Feuroleague_tracker%2Ftipoff_reminder.yaml) |

### By hand

The event entities are the easiest trigger: pick *Olympiacos scored* in the automation editor and, if you like, a shot type. Each basket fires on its own, even when several land between two updates. With **Delay live events by** set, they fire that many seconds later, in step with your TV.

<details>
<summary>Flash the lights when your team scores (threes only)</summary>

```yaml
alias: Olympiacos three-pointer
triggers:
  - trigger: state
    entity_id: event.olympiacos_piraeus_euroleague_team_scored
    not_from: unavailable
conditions:
  - condition: state
    entity_id: event.olympiacos_piraeus_euroleague_team_scored
    attribute: event_type
    state: three_pointer
actions:
  - action: light.turn_on
    target:
      entity_id: light.living_room
    data:
      color_name: red
      flash: short
```

Remove the condition to flash on every basket.

</details>

<details>
<summary>Notify the final result</summary>

```yaml
alias: EuroLeague final score
triggers:
  - trigger: state
    entity_id: event.olympiacos_piraeus_euroleague_game_events
    attribute: event_type
    to: game_final
actions:
  - action: notify.mobile_app_my_phone
    data:
      title: "{{ 'Win!' if trigger.to_state.attributes.won else 'Loss' }}"
      message: >
        {{ trigger.to_state.attributes.team }} {{ trigger.to_state.attributes.team_score }} –
        {{ trigger.to_state.attributes.opponent_score }} {{ trigger.to_state.attributes.opponent }}
```

</details>

<details>
<summary>Reminder 30 minutes before tip-off</summary>

```yaml
alias: Game starting soon
triggers:
  - trigger: time
    at:
      entity_id: sensor.olympiacos_piraeus_euroleague_next_game
      offset: "-00:30:00"
actions:
  - action: notify.mobile_app_my_phone
    data:
      message: >
        Tip-off in 30 minutes against
        {{ state_attr('sensor.olympiacos_piraeus_euroleague_next_game', 'opponent') }}
```

</details>

Every moment is also sent as an `euroleague_tracker_event` on the event bus, with a `type` of `game_started`, `quarter_end`, `team_scored`, `opponent_scored`, `lead_change` or `game_final`, and the same data as the entities (`points`, `shot` and `player` on baskets).

## FAQ

**Is the data official?**
It comes from EuroLeague's public API, the same one its website uses. There's no published developer programme, so EuroLeague could change or lock it at any time. If it starts refusing requests, a notice appears under **Settings → Repairs** and the integration keeps retrying; check the [issues](https://github.com/Big-Edge2297/ha-euroleague-tracker/issues) for news.

**Why do standings points differ from points scored?**
EuroLeague leaves overtime points out of the standings (points for, against and difference). The standings sensor shows the official standings values; the stats sensor shows real points scored.

**The logos don't show.**
They load from EuroLeague's image servers in your browser. If a network blocks them, the card shows the team code instead.

**Why don't I see the integration's icon?**
Home Assistant shows icons that ship with a custom integration from version 2026.3. On older versions you'll see a placeholder; everything else works.

**What changes in the playoffs?**
Nothing to set up. Games get their proper names (Play-in, Playoffs · Game 3, Final Four · Semifinal), the card shows the series score and seeds, the standings stay at the final regular-season table (the seeds), and the Standings view turns into a bracket. "If necessary" games of a series that is already decided are skipped.

**Can I use it with ha-teamtracker-card?**
Yes. Point the teamtracker card at the game sensor.

## Development

```bash
npm ci
npm run build        # build the card into custom_components/…/frontend/
npm test             # card tests (Node's test runner + jsdom)
pip install -r requirements_test.txt
pip install "$(python scripts/frontend_requirement.py)"
pytest               # integration tests, against real recorded API data
python scripts/make_demo_states.py && python scripts/screenshots.py   # regenerate docs/images
```

Every push runs the integration tests on the oldest supported Home Assistant (2025.1) and the newest, the card tests, HACS and hassfest validation, and a dependency audit. Dependabot proposes updates every Monday. See [CONTRIBUTING.md](CONTRIBUTING.md) for how releases work.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) or the [releases page](https://github.com/Big-Edge2297/ha-euroleague-tracker/releases).

## License

[MIT](LICENSE). EuroLeague, EuroCup and club names and logos belong to their owners.
