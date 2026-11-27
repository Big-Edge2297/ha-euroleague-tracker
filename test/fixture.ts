// Sensor states produced by the integration's own parser from real EuroLeague
// data (scripts/make_demo_states.py). tests/test_demo_states.py keeps this file
// in step with the parser.
import demo from "../scripts/harness/demo-states.json";

export const IDS = {
  game: "sensor.olympiacos_piraeus_euroleague_game",
  standings: "sensor.olympiacos_piraeus_euroleague_standings_position",
  stats: "sensor.olympiacos_piraeus_euroleague_season_stats",
};

export type GameKey = "pre" | "live" | "final";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function gameState(key: GameKey) {
  return clone((demo as any)[key]);
}

export function makeHass(gameKey: GameKey = "pre", overrides: { game?: any; states?: Record<string, any>; hass?: any } = {}) {
  const game = overrides.game ?? gameState(gameKey);
  return {
    language: "en",
    locale: { language: "en-GB", time_format: "24", time_zone: "server" },
    config: { time_zone: "Asia/Nicosia" },
    states: {
      [IDS.game]: { entity_id: IDS.game, ...game },
      [IDS.standings]: { entity_id: IDS.standings, ...clone((demo as any).standings) },
      [IDS.stats]: { entity_id: IDS.stats, ...clone((demo as any).stats) },
      ...(overrides.states ?? {}),
    },
    ...(overrides.hass ?? {}),
  };
}
