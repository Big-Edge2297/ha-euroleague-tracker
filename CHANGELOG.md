# Changelog

## v0.4.2 (2026-11-28)

### Card
- The countdown pill on the next game is in your team's colour (white with the team colour on the team-colour theme).
- In the next-game comparison, the side that's ahead on each row (last 5, home/away, last 10, point difference) is bold; a tie highlights neither.
- The Round tab groups games under a heading per day, with only the time next to each game; your game shows its live score and clock while it's on.
- Your team's row in the standings has the same coloured edge as in the Round tab and the bracket.
- Softer playoff and play-in colours, so your team's colour stands out (and the play-in numbers are now easier to read).
- "8,300 seats" instead of "cap. 8,300".

### Entities and device
- Club names without sponsor words: "ASVEL" instead of "LDLC ASVEL", "Barcelona" instead of "FC Barcelona".
- The Opponent sensor's crest is served on a light disc, so dark crests (ASVEL, Partizan, Virtus, Beşiktaş, Paris) show on dark themes.
- Only the Opponent sensor shows a crest; the score sensors have scoreboard icons. Live and Game status have icons of their own.
- The device shows "Olympiacos Piraeus · EuroLeague" instead of the team code, and Visit opens your team's page on the EuroLeague site.
- Record and Last result are enabled by default on new installs.
- The calendar is called Schedule on new installs (existing entity IDs don't change).

## v0.4.1 (2026-11-28)

### Fixed
- **Season shot zones fill in within minutes.** After the first ten games, the rest are read a minute later instead of fifteen, and the zones are saved so a restart doesn't read them again. While they fill in, the Shots tab says "10 of 14 games". The saved zones are deleted when you remove the integration.
- **The Round tab shows the round's days** ("3 – 4 Dec") instead of a game count that was always 10.
- **Times without a leading zero** in 12-hour format ("9:15 PM").
- **Screenshots workflow:** starts from the newest main and catches up before committing, so an upload during a run no longer makes it fail.

## v0.4.0 (2026-11-28)

### New
- **Play-in, playoffs and Final Four.** Postseason games get their real names ("Play-in · 7th v 8th", "Playoffs · Game 3", "Final Four · Championship game"), the best-of-five series score with every game of the series, both seeds, and a neutral venue at the Final Four (seeds instead of home and away). "If necessary" games of a decided series are skipped, and the standings stay at the final regular-season table.
- **Bracket**: once the regular season ends, the Standings view shows the play-in, the four series and the Final Four, with the table one tap away.
- **Playoff race** on the standings: how many games clear of (or behind) the playoff and play-in lines, dashed lines in the table, and clinched or out of reach once it is certain.
- **Calendar** entity with every game of the season, results added as they come in.
- **Compact card** (`custom:euroleague-tracker-compact-card`): next game, live score or result on one line for sections dashboards. Tap for the details.
- **Blueprints**, with one-click import buttons: flash the lights when your team scores, a final-score notification and a tip-off reminder.
- New sensor attributes: `phase_code`, `series`, `team_seed`, `opponent_seed`, `neutral_site` on the game sensor; `playoff_race` and `bracket` on the standings sensor.

## v0.3.0 (2026-11-28)

### New
- **Stats, redesigned** into three tabs:
  - **Team**: where your team ranks in the league for ten stats, each on a bar from the league's worst to its best with the league average marked; attack against defence, with points scored and allowed per game and their ranks.
  - **Players**: the season's form, with the point margin of every game; your players among the league leaders, with their headshots and the current leader for comparison.
  - **Shots**: the season's shooting by court zone (at the rim, paint, mid-range, corner threes, above the break), shaded by points per shot.
- **Score flow** on live and final games: who led and by how much, minute by minute, with the biggest leads.
- **Head to head** on the next game: the last five meetings with that opponent, from this season and the two before.
- **Round tab**: every game of the round, your team's highlighted, with arrows to the rounds before and after. Turn it off with `show_round_tab: false`, or show it alone with `view: round`.
- New sensor attributes for all of the above (`league_ranks`, `attack_defence`, `form`, `shot_zones`, `score_flow`, `head_to_head`, `scoreboard`), kept out of the recorder.

### Changed
- The last game's shot chart moved from the Stats view to the final result on the Game view.

## v0.2.0 (2026-11-27)

### New
- **An event for every basket.** *Team scored* and *Opponent scored* event entities fire once per free throw, two- or three-pointer, with the player, the points and the score at that moment. Baskets that land between two updates each fire on their own, in order.
- **Delay live events by** (option): holds baskets and other live events back by up to 180 seconds, so lights and notifications line up with a TV or stream that runs behind.
- **Game events** event entity: tip-off, quarter ends, lead changes and the final buzzer.
- New entities: *Next game* (timestamp), *Game status*, *Live* (binary sensor), *Team score*, *Opponent score* and *Opponent* (with the crest as its picture). Also *Last result*, *Record*, *Streak*, *Point difference* and *Games behind playoffs*, which start disabled.

### Changed
- The `team_scored` and `opponent_scored` bus events now fire once per basket (with `points`, `shot` and `player`) instead of once per score change, and honour the new delay option.

### Fixed
- Dark crests (ASVEL, Partizan, Beşiktaş, Virtus) were hard to see on the dark and team themes; crests now sit on a light disc there.

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
