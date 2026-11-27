import "./dom";

import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { EuroLeagueTrackerCard } from "../src/euroleague-tracker-card";
import { IDS, gameState, makeHass, type GameKey } from "./fixture";

type Card = EuroLeagueTrackerCard & { hass: any; updateComplete: Promise<boolean>; shadowRoot: ShadowRoot };

async function mount(config: Record<string, unknown> = {}, hass: any = makeHass()): Promise<Card> {
  const el = document.createElement("euroleague-tracker-card") as Card;
  el.setConfig({ type: "custom:euroleague-tracker-card", entity: IDS.game, view: "game", ...config } as any);
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const game = (key: GameKey, config: Record<string, unknown> = {}) => mount(config, makeHass(key));
const $ = (el: Card, sel: string) => el.shadowRoot.querySelector(sel);
const $$ = (el: Card, sel: string) => [...el.shadowRoot.querySelectorAll(sel)];
/** Visible text, with a space between separate elements (grid cells, spans). */
function text(node: Node | null): string {
  if (!node) return "";
  const parts: string[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === 3) parts.push(n.textContent ?? "");
    else if (n.nodeType === 1 || n.nodeType === 11) {
      if (n.nodeType === 1 && ["STYLE", "SCRIPT"].includes((n as Element).tagName)) return;
      parts.push(" ");
      n.childNodes.forEach(walk);
      parts.push(" ");
    }
  };
  walk(node);
  return parts.join("").replace(/\s+/g, " ").trim();
}
const cardText = (el: Card) => text($(el, "ha-card"));

beforeEach(() => {
  document.body.innerHTML = "";
});

// ------------------------------------------------------------- configuration

test("setConfig needs the game sensor", () => {
  const el = document.createElement("euroleague-tracker-card") as Card;
  assert.throws(() => el.setConfig({ type: "custom:euroleague-tracker-card" } as any), /game sensor/);
});

test("a missing entity shows a warning instead of breaking the dashboard", async () => {
  const el = await mount({ entity: "sensor.nope" });
  assert.match(cardText(el), /Entity not found: sensor\.nope/);
});

test("the card picker stub finds the integration's game sensor", () => {
  const hass = makeHass();
  hass.states["sensor.something_else"] = { entity_id: "sensor.something_else", state: "1", attributes: {} };
  const stub = (EuroLeagueTrackerCard as any).getStubConfig(hass);
  assert.equal(stub.entity, IDS.game);
  assert.equal(stub.theme, "auto");
});

test("the visual editor offers every option", () => {
  const form = (EuroLeagueTrackerCard as any).getConfigForm();
  const names: string[] = [];
  const walk = (items: any[]) => items.forEach((i) => (i.schema ? walk(i.schema) : names.push(i.name)));
  walk(form.schema);
  assert.deepEqual(names.sort(), [
    "entity",
    "play_by_play_rows",
    "show_shot_chart",
    "standings_entity",
    "standings_rows",
    "stats_entity",
    "team_color",
    "theme",
    "view",
  ]);
  assert.equal(form.computeLabel({ name: "theme" }), "Theme");
});

test("it only re-renders when one of its own sensors changes", async () => {
  const el = await mount();
  const hass = makeHass();
  const unrelated = { ...hass, states: { ...el.hass.states, "light.kitchen": { state: "on", attributes: {} } } };
  assert.equal((el as any).shouldUpdate(new Map([["hass", undefined]])), true, "the first hass always renders");
  el.hass = unrelated;
  assert.equal((el as any).shouldUpdate(new Map([["hass", { states: unrelated.states }]])), false);
  const changed = { ...unrelated.states, [IDS.game]: { ...unrelated.states[IDS.game], state: "IN" } };
  el.hass = { ...unrelated, states: changed };
  assert.equal((el as any).shouldUpdate(new Map([["hass", { states: unrelated.states }]])), true);
});

// ------------------------------------------------------------------ next game

test("next game: kick-off in the user's time zone, positions, records and countdown", async () => {
  const el = await game("pre");
  const t = cardText(el);
  assert.match(t, /EuroLeague · Round 15/);
  assert.match(text($(el, ".pill")), /^in 7 days$/);
  assert.match(text($(el, ".when")), /Fri 4 Dec 21:15/, "19:15 UTC is 21:15 in Nicosia");
  const teams = $$(el, ".team").map(text);
  assert.deepEqual(teams, ["Olympiacos 1st · 11-3", "LDLC ASVEL 19th · 4-10"], "crests are images, so no code text");
  assert.match(t, /Sunel Arena · cap\. 8,300/);
});

test("next game: last five (oldest first), home and away records, last ten and point difference", async () => {
  const el = await game("pre");
  const forms = $$(el, ".compare .form").map((f) => [...f.querySelectorAll(".chip")].map((c) => c.textContent).join(""));
  assert.deepEqual(forms, ["LWWWW", "LLLLL"]);
  const compare = text($(el, ".compare"));
  assert.match(compare, /5-2 Home \/ Away 1-5/, "Olympiacos at home, ASVEL away");
  assert.match(compare, /8-2 Last 10 2-8/);
  assert.match(compare, /\+116 Point diff −115/);
});

test("next game in 12-hour time when the user prefers it", async () => {
  const hass = makeHass("pre", { hass: { locale: { language: "en-US", time_format: "12", time_zone: "server" } } });
  const el = await mount({}, hass);
  assert.match(text($(el, ".when .time")), /09:15\s?PM/i);
});

// ----------------------------------------------------------------------- live

test("live: score, clock and the quarter in play", async () => {
  const el = await game("live");
  assert.equal(text($(el, ".pill.live")), "LIVE · Q3 04:21");
  assert.equal(text($(el, ".score")), "63 – 58");
  const cells = $$(el, ".quarters span").map(text);
  // header row, then OLY and HTA rows: Q1, Q2, Q3 (in play), Q4 not started
  assert.deepEqual(cells, ["", "Q1", "Q2", "Q3", "Q4", "OLY", "32", "17", "14", "–", "HTA", "29", "15", "14", "–"]);
  assert.deepEqual(
    $$(el, ".quarters .current").map(text),
    ["Q3", "14", "14"],
    "the current quarter is highlighted",
  );
});

test("live: play-by-play, newest first, with the score on scoring plays", async () => {
  const el = await game("live");
  const plays = $$(el, ".play").map(text);
  assert.equal(plays.length, 4);
  assert.equal(plays[0], "04:21 Sasha Vezenkov: Two Pointer (11 pt) 63-58");
  assert.equal(plays[1], "04:30 Evan Fournier: Def Rebound");
  assert.ok($(el, ".play.scoring"), "scoring plays are marked");
});

test("live: play_by_play_rows sets how many plays show, 0 hides them", async () => {
  assert.equal($$(await game("live", { play_by_play_rows: 2 }), ".play").length, 2);
  const none = await game("live", { play_by_play_rows: 0 });
  assert.equal($$(none, ".play").length, 0);
  assert.doesNotMatch(cardText(none), /Play-by-play/);
});

test("live: the venue line shows attendance", async () => {
  assert.match(cardText(await game("live")), /Sunel Arena · 6,337 fans/);
});

// ---------------------------------------------------------------------- final

test("final: result pill, score and quarter scores", async () => {
  const el = await game("final");
  assert.equal(text($(el, ".pill")), "Final · W");
  assert.ok($(el, ".pill.win"));
  assert.equal(text($(el, ".score")), "104 – 79");
  const cells = $$(el, ".quarters span").map(text);
  assert.deepEqual(cells.slice(5), ["OLY", "32", "17", "23", "32", "HTA", "29", "15", "22", "13"]);
});

test("final: top performers by PIR from the box score", async () => {
  const el = await game("final");
  const players = text($(el, ".players"));
  assert.match(players, /^Player PTS REB AST PIR Cory Joseph #34 27 1 3 31 Evan Fournier #94 23 1 11 27/);
  assert.equal($$(el, ".players .pname").length, 4);
});

test("final: team comparison bars, our share drawn in the accent", async () => {
  const el = await game("final");
  const labels = $$(el, ".bar-label").map(text);
  assert.deepEqual(labels, ["2P%", "3P%", "FT%", "Rebounds", "Assists", "Turnovers"]);
  const rebounds = $$(el, ".bar .us")[3] as HTMLElement;
  assert.equal(rebounds.getAttribute("style"), "width:60.0%", "36 of 60 rebounds");
  assert.match(text($(el, ".bars")), /^65\.0 2P% 60\.9/);
});

test("final: the footer points to the next game", async () => {
  assert.match(cardText(await game("final")), /6,337 fans · Next: vs ASV, Fri 4 Dec/);
});

test("final: a loss shows L", async () => {
  const lost = gameState("final");
  Object.assign(lost.attributes, { team_winner: false, opponent_winner: true });
  const el = await mount({}, makeHass("final", { game: lost }));
  assert.equal(text($(el, ".pill")), "Final · L");
  assert.ok($(el, ".pill.loss"));
});

test("the home team is always on the left, whichever team you follow", async () => {
  const away = gameState("final");
  const a = away.attributes;
  // Same game seen by a Hapoel fan: swap the team and opponent fields.
  for (const key of Object.keys(a)) {
    if (key.startsWith("team_") && `opponent_${key.slice(5)}` in a) {
      const other = `opponent_${key.slice(5)}`;
      [a[key], a[other]] = [a[other], a[key]];
    }
  }
  a.quarter_scores = { team: a.quarter_scores.opponent, opponent: a.quarter_scores.team };
  const el = await mount({}, makeHass("final", { game: away }));
  assert.deepEqual($$(el, ".team-name").map(text), ["Olympiacos", "Hapoel TLV"]);
  assert.equal(text($(el, ".score")), "104 – 79");
  assert.deepEqual($$(el, ".quarters .name").map(text), ["OLY", "HTA"]);
});

test("no game this season shows the sensor's message", async () => {
  const none = { state: "NOT_FOUND", attributes: { api_message: "No game found for this team in the current season" } };
  const el = await mount({}, makeHass("pre", { game: none }));
  assert.match(cardText(el), /No game found for this team in the current season/);
});

// ------------------------------------------------------------------ standings

test("standings: all 20 teams, zones, your team highlighted", async () => {
  const el = await mount({ view: "standings" });
  const rows = $$(el, ".srow:not(.header)");
  assert.equal(rows.length, 20);
  assert.equal(text(rows[0]), "1 Olympiacos 11-3 +116 L W W W W");
  assert.ok(rows[0].classList.contains("me"));
  assert.equal($$(el, ".pos.playoffs").length, 6);
  assert.equal($$(el, ".pos.play_in").length, 4);
  assert.match(text(rows[10]), /^11 Paris 8-6 −20/);
  assert.match(text($(el, ".pill")), /After round 14/);
});

test("standings_rows shows a window around your team", async () => {
  const top = await mount({ view: "standings", standings_rows: 5 });
  assert.deepEqual(
    $$(top, ".srow:not(.header) .pos").map(text),
    ["1", "2", "3", "4", "5"],
    "first place: the window starts at the top",
  );

  const asvel = gameState("pre");
  Object.assign(asvel.attributes, { team_abbr: "ASV" });
  const bottom = await mount({ view: "standings", standings_rows: 5 }, makeHass("pre", { game: asvel }));
  assert.deepEqual($$(bottom, ".srow:not(.header) .pos").map(text), ["16", "17", "18", "19", "20"]);
  assert.equal(text($(bottom, ".srow.me .tn")), "LDLC ASVEL");
});

// ---------------------------------------------------------------------- stats

test("stats: season averages with one decimal, PIR whole", async () => {
  const el = await mount({ view: "stats" });
  const tiles = $$(el, ".tile").map(text);
  assert.deepEqual(tiles, [
    "Points 90.4",
    "Rebounds 36.6",
    "Assists 20.6",
    "2P% 60.2",
    "3P% 34.0",
    "PIR 107",
    "Steals 7.4",
    "Turnovers 12.9",
    "FT% 76.6",
  ]);
  assert.match(text($(el, ".head")), /Olympiacos · 2026-27 14 games/);
});

test("stats: your players among the league leaders", async () => {
  const el = await mount({ view: "stats" });
  const ranks = text($(el, ".ranks"));
  assert.match(ranks, /^Sasha Vezenkov PIR 1st · 23\.9 Sasha Vezenkov Points 2nd · 20\.2 Codi Miller-McIntyre Assists 4th · 5\.1/);
  assert.match(cardText(el), /Points: Nadir Hifi \(PRS\) 20\.4/);
});

test("stats: the shot chart has all 70 field goals, 38 made", async () => {
  const el = await mount({ view: "stats" }, makeHass("final"));
  assert.equal($$(el, "svg.court circle.made").length, 38);
  assert.equal($$(el, "svg.court circle.miss").length, 32);
  assert.match(text($(el, ".shot-legend")), /2P 26\/40 · 3P 12\/30/);
  assert.match($(el, "svg.court")!.getAttribute("aria-label")!, /38 of 70 field goals/);
});

test("stats: show_shot_chart: false hides the chart", async () => {
  const el = await mount({ view: "stats", show_shot_chart: false }, makeHass("final"));
  assert.equal($(el, "svg.court"), null);
});

test("stats and standings find their sensors even when renamed", async () => {
  const hass = makeHass("final");
  for (const [from, to] of [
    [IDS.standings, "sensor.my_table"],
    [IDS.stats, "sensor.my_stats"],
  ]) {
    hass.states[to] = { ...hass.states[from], entity_id: to };
    delete hass.states[from];
  }
  assert.equal($$(await mount({ view: "standings" }, hass), ".srow:not(.header)").length, 20);
  assert.equal($$(await mount({ view: "stats" }, hass), ".tile").length, 9);
});

// ----------------------------------------------------------------- tabs, theme

test("tabs switch between game, standings and stats", async () => {
  const el = await mount({ view: "tabs" }, makeHass("live"));
  const tabs = $$(el, ".tabs button") as HTMLButtonElement[];
  assert.deepEqual(tabs.map(text), ["Game", "Standings", "Stats"]);
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  assert.ok($(el, ".score"));

  tabs[1].click();
  await el.updateComplete;
  assert.equal(($$(el, ".tabs button")[1] as HTMLElement).getAttribute("aria-selected"), "true");
  assert.equal($$(el, ".srow:not(.header)").length, 20);

  ($$(el, ".tabs button")[2] as HTMLElement).click();
  await el.updateComplete;
  assert.equal($$(el, ".tile").length, 9);
});

test("a single view has no tabs", async () => {
  assert.equal($(await mount({ view: "standings" }), ".tabs"), null);
});

test("themes set the colours on the card", async () => {
  const style = async (config: Record<string, unknown>) => (await mount(config)).shadowRoot.querySelector("ha-card")!.getAttribute("style")!;
  assert.match(await style({ theme: "team" }), /--elt-bg:#C62828;--elt-fg:#FFFFFF/);
  assert.match(await style({ theme: "team", team_color: "#F2C200" }), /--elt-bg:#F2C200;--elt-fg:#111111/);
  assert.match(await style({ theme: "dark" }), /--elt-bg:#1C1C1C/);
  assert.match(await style({ theme: "light" }), /--elt-bg:#FFFFFF/);
  assert.match(await style({}), /--elt-bg:var\(--ha-card-background/, "auto is the default");
  assert.match(await style({ theme: "dark", team_color: "not a colour" }), /--elt-accent:#C62828/, "invalid colours are ignored");
});

test("team theme: the crest is a watermark, and disappears if it can't load", async () => {
  const el = await mount({ theme: "team" });
  const mark = $(el, "img.watermark") as HTMLImageElement;
  assert.ok(mark);
  mark.dispatchEvent(new Event("error"));
  await el.updateComplete;
  assert.equal($(el, "img.watermark"), null);
});

test("crests sit on a backing disc, small ones in the standings", async () => {
  const el = await game("pre");
  assert.equal($$(el, ".team .plate:not(.small) img.crest").length, 2);
  const table = await mount({ view: "standings" });
  assert.ok($$(table, ".srow .plate.small img").length > 0);
});

test("a crest that fails to load falls back to the team code", async () => {
  const el = await game("pre");
  const crests = $$(el, ".team img.crest") as HTMLImageElement[];
  assert.equal(crests.length, 2);
  assert.match(crests[0].src, /media-cdn\.incrowdsports\.com/);
  crests[0].dispatchEvent(new Event("error"));
  await el.updateComplete;
  assert.equal(text($(el, ".team .crest-fallback")), "OLY");
  assert.equal($$(el, ".team img.crest").length, 1);
});

test("the card registers itself in the card picker", () => {
  const entry = (window as any).customCards.find((c: any) => c.type === "euroleague-tracker-card");
  assert.equal(entry.name, "EuroLeague Tracker");
  assert.equal(entry.preview, true);
});
