# Changelog

## v0.1.0 (2026-11-27)

First release.

### Integration
- Set up from the UI: choose EuroLeague or EuroCup, then your team. Add it again to follow more teams.
- **Game sensor**, compatible with ha-teamtracker (`PRE`, `IN`, `POST`, `NOT_FOUND`): score, quarter and clock, quarter-by-quarter scores, play-by-play, top players by PIR, team stats, shot locations, both teams' form, records and league positions, the previous and next game.
- **Standings sensor**: your position as the state, the full table as an attribute, with playoff and play-in zones.
- **Season stats sensor**: per-game averages and where your players rank among the league leaders.
- `euroleague_tracker_event` for automations: `game_started`, `quarter_end`, `team_scored`, `opponent_scored`, `lead_change`, `game_final`.
- Updates every 15 minutes between games, every minute before tip-off and every 15 seconds during a game (adjustable).
- A Repairs notice if the EuroLeague API ever stops accepting requests; it clears itself when access returns.
- Diagnostics download; large attributes are kept out of the recorder.
- Its own icon and logo (shown on Home Assistant 2026.3 and later).

### Dashboard card
- Ships with the integration and loads by itself, with a visual editor.
- Game, Standings and Stats views, as tabs or one at a time.
- Themes: follow Home Assistant, dark, light, or your team's colours.
- Next game in your time zone with a countdown, live score with play-by-play, final result with top performers and a team comparison, shot chart.

### Supported versions
- Home Assistant 2025.1 or newer.
