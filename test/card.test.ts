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
    "show_round_tab",
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

test("stats · team: attack, defence and league average", async () => {
  const el = await mount({ view: "stats" });
  assert.deepEqual(
    $$(el, ".subtabs button").map(text),
    ["Team", "Players", "Shots"],
  );
  assert.deepEqual($$(el, ".facts.two .tile").map(text), [
    "Attack 90.4 scored 4th · +3.3 vs avg",
    "Defence 81.3 allowed 4th · −5.8 vs avg",
  ]);
  assert.match(cardText(el), /Attack vs defence Net \+9\.1/);
  assert.match($$(el, "svg.chart")[0].getAttribute("aria-label")!, /90\.4 scored, 81\.3 allowed, league average 87\.1/);
  assert.match(text($(el, ".head")), /Olympiacos · 2026-27 Per game · 14 GP/);
});

test("stats · team: every stat's league rank on a worst-to-best bar", async () => {
  const el = await mount({ view: "stats" });
  const rows = $$(el, ".rankbars .rb").map((n) => n.getAttribute("aria-label"));
  assert.deepEqual(rows, [
    "Points 90.4, 4th of 20",
    "Rebounds 36.6, 10th of 20",
    "Assists 20.6, 3rd of 20",
    "Steals 7.4, 5th of 20",
    "Turnovers 12.9, 9th of 20",
    "Blocks 2.4, 14th of 20",
    "PIR 107, 2nd of 20",
    "2P% 60.2, 1st of 20",
    "3P% 34, 16th of 20",
    "FT% 76.6, 10th of 20",
  ]);
  // 2P% is the league's best: the dot sits at the right end.
  const dot = (i: number) => ($$(el, ".rankbars .rb .p")[i] as HTMLElement).style.left;
  assert.equal(dot(7), "100%");
  // Turnovers are flipped: 12.9 against a worst of 14.4 and a best of 10.5.
  assert.equal(dot(4), `${(((12.9 - 14.4) / (10.5 - 14.4)) * 100).toFixed(1)}%`);
  assert.deepEqual(
    $$(el, ".rankbars .r.top").map(text),
    ["3rd", "2nd", "1st"],
  );
  assert.equal(text($$(el, ".rankbars .v")[6]), "107");
});

test("stats · team: without league ranks it falls back to the season averages", async () => {
  const hass = makeHass();
  hass.states[IDS.stats].attributes.league_ranks = {};
  hass.states[IDS.stats].attributes.attack_defence = null;
  const el = await mount({ view: "stats" }, hass);
  assert.deepEqual($$(el, ".tiles .tile").map(text), [
    "Points 90.4",
    "Rebounds 36.6",
    "Assists 20.6",
    "2P% 60.2",
    "3P% 34.0",
    "PIR 107",
  ]);
});

async function statsTab(name: string, hass = makeHass()) {
  const el = await mount({ view: "stats" }, hass);
  const btn = $$(el, ".subtabs button").find((b) => text(b) === name) as HTMLElement;
  btn.click();
  await el.updateComplete;
  return el;
}

test("stats · players: season form, one bar per game", async () => {
  const el = await statsTab("Players");
  assert.equal($$(el, ".subtabs button")[1].getAttribute("aria-selected"), "true");
  assert.equal($$(el, "svg.chart rect.win").length, 11);
  assert.equal($$(el, "svg.chart rect.loss").length, 3);
  assert.deepEqual(
    $$(el, "svg.chart text.val").map(text),
    ["+17", "+2", "−2", "+23", "+5", "+5", "−3", "+8", "+6", "−5", "+29", "+2", "+16", "+25"],
  );
  assert.match(cardText(el), /Season form · point margin Avg \+9\.1/);
  assert.match(text($(el, ".head")), /11-3 · 1st/);
});

test("stats · players: your players among the league leaders, with headshots", async () => {
  const el = await statsTab("Players");
  const rows = $$(el, ".leader").map(text);
  assert.equal(rows[0], "Sasha Vezenkov PIR · League leader 23.9 1st");
  assert.equal(rows[1], "Sasha Vezenkov Points · Leader: Nadir Hifi (PRS) 20.4 20.2 2nd");
  // No headshot in the data: initials instead.
  assert.equal(rows[2], "CM Codi Miller-McIntyre Assists · Leader: TJ Shorts (PAM) 5.9 5.1 4th");
  assert.match(($(el, ".leader img.head-shot") as HTMLImageElement).src, /^https:\/\/media-cdn/);
});

test("stats · players: a headshot that fails to load shows initials", async () => {
  const el = await statsTab("Players");
  const img = $(el, ".leader img.head-shot") as HTMLImageElement;
  img.dispatchEvent(new Event("error"));
  await el.updateComplete;
  assert.equal(text($(el, ".leader .head-shot.fallback")), "SV");
});

test("stats · shots: season zones from 934 shots", async () => {
  const el = await statsTab("Shots");
  assert.match(text($(el, ".head")), /14 games · 934 shots/);
  assert.match(cardText(el), /Season shooting by zone 464\/934 FG · 49\.7%/);
  const table = text($(el, ".zone-table"));
  assert.match(table, /At the rim 171\/209 81\.8% 1\.64/);
  assert.match(table, /Above-break three 96\/299 32\.1% 0\.96/);
  const label = $(el, "svg.court.zones")!.getAttribute("aria-label")!;
  assert.match(label, /At the rim 82%, Paint 49%, Mid-range 40%, Corner three 42%, Above-break three 32%/);
  // The rim (1.64 points a shot) is shaded darker than mid-range (0.81).
  const op = (i: number) => Number(($$(el, ".zone-table .sw")[i] as HTMLElement).style.opacity);
  assert.ok(op(0) > op(2));
});

test("stats · shots: nothing yet shows a message", async () => {
  const hass = makeHass();
  hass.states[IDS.stats].attributes.shot_zones = null;
  const el = await statsTab("Shots", hass);
  assert.match(cardText(el), /Shot locations aren't available yet/);
});

test("final: score flow with the biggest leads", async () => {
  const el = await game("final");
  const label = $(el, "svg.chart")!.getAttribute("aria-label")!;
  assert.equal(label, "Score flow: largest OLY lead 25, largest HTA lead 6");
  assert.deepEqual($$(el, ".facts .tile").map(text), [
    "Biggest lead +25 · 39'",
    "HTA biggest +6 · 12'",
    "Final margin +25",
  ]);
  assert.equal($$(el, "svg.chart polyline.flow")[0].getAttribute("points")!.split(" ").length, 41);
});

test("live: the score flow so far", async () => {
  const el = await game("live");
  assert.equal($(el, "svg.chart polyline.flow")!.getAttribute("points")!.split(" ").length, 26);
  assert.match(text($$(el, ".facts .tile")[2]), /Now \+5/);
});

test("final: the last game's shot chart has all 70 field goals, 38 made", async () => {
  const el = await game("final");
  assert.equal($$(el, "svg.court circle.made").length, 38);
  assert.equal($$(el, "svg.court circle.miss").length, 32);
  assert.match(text($(el, ".shot-legend")), /2P 26\/40 · 3P 12\/30/);
  assert.match($(el, "svg.court")!.getAttribute("aria-label")!, /38 of 70 field goals/);
});

test("show_shot_chart: false hides the last game's chart", async () => {
  const el = await game("final", { show_shot_chart: false });
  assert.equal($(el, "svg.court"), null);
});

test("next game: head to head, newest first", async () => {
  const el = await game("pre");
  assert.match(cardText(el), /Head to head · last 4 OLY leads 3-1/);
  assert.deepEqual($$(el, ".h2h-row").map(text), [
    "3 Apr 2026 ASV 74 – 82 OLY W",
    "19 Dec 2025 OLY 107 – 84 ASV W",
    "25 Mar 2025 ASV 81 – 70 OLY L",
    "12 Nov 2024 OLY 94 – 92 ASV W",
  ]);
  assert.match(cardText(el), /Average margin \+5\.5/);
});

test("round: every game of the round, yours highlighted", async () => {
  const el = await mount({ view: "round" }, makeHass("final"));
  assert.match(text($(el, ".head")), /Round 14 · results 10 games/);
  const games = $$(el, ".bgame");
  assert.equal(games.length, 10);
  const mine = $$(el, ".bgame.me");
  assert.equal(mine.length, 1);
  assert.equal(text(mine[0]), "OLY 104 HTA 79");
  assert.equal(text(mine[0].querySelector(".side.w")), "OLY 104");
});

test("round: arrows step through rounds; fixtures show tip-off times", async () => {
  const el = await mount({ view: "round" }, makeHass("final"));
  const [prev, next] = $$(el, ".nav") as HTMLButtonElement[];
  next.click();
  await el.updateComplete;
  assert.match(text($(el, ".head")), /Round 15 · fixtures/);
  const mine = text($(el, ".bgame.me"));
  assert.equal(mine, "OLY ASV Fri 4 Dec · 21:15");
  assert.equal(($$(el, ".nav")[1] as HTMLButtonElement).disabled, true);
  for (let i = 0; i < 2; i++) {
    ($$(el, ".nav")[0] as HTMLElement).click();
    await el.updateComplete;
  }
  assert.match(text($(el, ".head")), /Round 13/);
  assert.equal(prev.disabled, true);
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
  assert.equal($$(await mount({ view: "stats" }, hass), ".rankbars .rb").length, 10);
  assert.equal($$(await mount({ view: "round" }, hass), ".bgame").length, 10);
});

// ----------------------------------------------------------------- tabs, theme

test("tabs switch between game, standings, stats and round", async () => {
  const el = await mount({ view: "tabs" }, makeHass("live"));
  const tabs = $$(el, ".tabs button") as HTMLButtonElement[];
  assert.deepEqual(tabs.map(text), ["Game", "Standings", "Stats", "Round"]);
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  assert.ok($(el, ".score"));

  tabs[1].click();
  await el.updateComplete;
  assert.equal(($$(el, ".tabs button")[1] as HTMLElement).getAttribute("aria-selected"), "true");
  assert.equal($$(el, ".srow:not(.header)").length, 20);

  ($$(el, ".tabs button")[2] as HTMLElement).click();
  await el.updateComplete;
  assert.equal($$(el, ".rankbars .rb").length, 10);

  ($$(el, ".tabs button")[3] as HTMLElement).click();
  await el.updateComplete;
  assert.equal($$(el, ".bgame").length, 10);
});

test("show_round_tab: false hides the Round tab", async () => {
  const el = await mount({ view: "tabs", show_round_tab: false });
  assert.deepEqual($$(el, ".tabs button").map(text), ["Game", "Standings", "Stats"]);
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

// ------------------------------------------------------- v0.4.0 postseason

const post = (key: GameKey, config: Record<string, unknown> = {}) =>
  mount(config, makeHass(key, { standings: "standings_post" }));

test("playoffs: round label, seeds and the series score (real 2025-26 Game 3)", async () => {
  const el = await post("po_final");
  assert.equal(text($(el, ".eyebrow")), "Playoffs · Game 3");
  assert.deepEqual($$(el, ".team-sub").map(text), ["8th seed · Home", "1st seed · Away"]);
  assert.match(text($(el, ".series .head")), /^OLY win the series 3-0 Best of 5$/);
  assert.deepEqual($$(el, ".series .sg").map(text), [
    "G1 W 91-70",
    "G2 W 94-64",
    "G3 W 105-82",
    "G4 not needed",
    "G5 not needed",
  ]);
  assert.equal(text($(el, ".series .sg.current")), "G3 W 105-82");
});

test("playoffs: a series still open shows the coming games", async () => {
  const hass = makeHass("po_final", { standings: "standings_post" });
  const se = hass.states[IDS.game].attributes.series;
  se.games = se.games.slice(0, 2);
  se.games.push({ game_number: 3, played: false, date: "2026-05-05T17:45:00+00:00" });
  Object.assign(se, { decided: false, status: "OLY lead 2-0", game_number: 3 });
  hass.states[IDS.game].state = "PRE";
  const el = await mount({}, hass);
  assert.deepEqual($$(el, ".series .sg").map(text).slice(2), ["G3 Tue 5 May", "G4 if needed", "G5 if needed"]);
  assert.equal(text($(el, ".series .sg.current")), "G3 Tue 5 May");
});

test("Final Four: neutral venue, seeds instead of home and away, the road there", async () => {
  const el = await post("ff_pre");
  assert.equal(text($(el, ".eyebrow")), "Final Four · Championship game");
  assert.deepEqual($$(el, ".team-sub").map(text), ["1st seed", "3rd seed"]);
  assert.equal(
    text($(el, ".compare")),
    "W 79-61 ULK Semifinal W 105-90 PAM 3-0 MCO Playoffs 3-1 HTA 26-12 Regular season 24-14",
  );
  assert.match(text($(el, ".foot")), /^Neutral venue · Telekom Center Athens/);
});

test("standings: the bracket once the regular season is over, the table one tap away", async () => {
  const el = await post("po_final", { view: "standings" });
  assert.match(text($(el, ".head")), /EuroLeague 2025-26 · postseason Champion OLY/);
  assert.deepEqual($$(el, ".subtabs button").map(text), ["Bracket", "Table"]);
  const boxes = $$(el, ".bbox").map(text);
  assert.deepEqual(boxes.slice(0, 3), ["7th v 8th 7 PAN 87 8 MCO 79", "9th v 10th 9 BAR 80 10 RED 72", "for 8th place 8 MCO 79 9 BAR 70"]);
  assert.deepEqual(boxes.slice(3, 7), [
    "Playoff A · OLY win 3-0 1 OLY 3 8 MCO 0",
    "Playoff B · ULK win 3-1 4 ULK 3 5 ZAL 1",
    "Playoff C · MAD win 3-1 3 MAD 3 6 HTA 1",
    "Playoff D · PAM win 3-2 2 PAM 3 7 PAN 2",
  ]);
  assert.deepEqual(boxes.slice(7), [
    "Semifinal · 22 May 1 OLY 79 4 ULK 61",
    "Semifinal · 22 May 2 PAM 90 3 MAD 105",
    "Championship game · 24 May 1 OLY 92 3 MAD 85",
  ]);
  // Olympiacos's boxes are marked: series A, semifinal, final.
  assert.equal($$(el, ".bbox.me").length, 3);
  ($$(el, ".subtabs button")[1] as HTMLElement).click();
  await el.updateComplete;
  assert.equal($$(el, ".srow:not(.header)").length, 20);
});

test("standings: the playoff race with both lines in the table", async () => {
  const el = await mount({ view: "standings" });
  assert.deepEqual($$(el, ".tile.race").map(text), [
    "Playoff line 3 games clear of 7th (RED)",
    "Play-in line 3 games clear of 11th (PRS)",
  ]);
  assert.match(cardText(el), /Games left 24 until 18 Apr/);
  assert.deepEqual($$(el, ".cutline").map(text), ["Playoff line", "Play-in line"]);
  assert.equal($(el, ".subtabs"), null);
});

test("standings: clinched and out-of-reach read plainly", async () => {
  const hass = makeHass();
  const race = hass.states[IDS.standings].attributes.playoff_race;
  race.playoffs = { line: 6, status: "clinched", inside: true, games: 9, rival: "RED" };
  race.play_in = { line: 10, status: "out", inside: false, games: 1.5, rival: "ZAL" };
  const el = await mount({ view: "standings" }, hass);
  assert.deepEqual($$(el, ".tile.race").map(text), ["Playoff line Clinched", "Play-in line 1.5 games behind 10th (ZAL)"]);
});

// ------------------------------------------------------------ compact card

async function compact(key: GameKey, config: Record<string, unknown> = {}) {
  const el = document.createElement("euroleague-tracker-compact-card") as Card;
  el.setConfig({ type: "custom:euroleague-tracker-compact-card", entity: IDS.game, ...config } as any);
  el.hass = makeHass(key);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

test("compact: next game, live score and result on one line", async () => {
  const pre = await compact("pre");
  assert.equal($$(pre, ".crests img.c-crest").length, 2);
  assert.equal(text($(pre, ".compact")), "OLY vs ASV Fri 4 Dec · 21:15 · Round 15 in 7 days");
  assert.equal(text($(await compact("live"), ".compact")), "OLY 63 – 58 HTA Sasha Vezenkov: Two Pointer (11 pt) Q3 04:21");
  assert.equal(text($(await compact("final"), ".compact")), "OLY 104 – 79 HTA Next: vs ASV, Fri 4 Dec Final · W");
  assert.equal(
    text($(await compact("po_final"), ".compact")),
    "MCO 82 – 105 OLY Playoffs · Game 3 · OLY win the series 3-0 Final · W",
  );
});

test("compact: tapping opens the game sensor's details", async () => {
  const el = await compact("pre");
  const seen: string[] = [];
  el.addEventListener("hass-more-info", (e: any) => seen.push(e.detail.entityId));
  ($(el, "ha-card") as HTMLElement).click();
  ($(el, "ha-card") as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  assert.deepEqual(seen, [IDS.game, IDS.game]);
  assert.equal($(el, "ha-card")!.getAttribute("role"), "button");
});

test("compact: one row in sections, a short editor and its own picker entry", () => {
  const Compact = customElements.get("euroleague-tracker-compact-card") as any;
  const el = new Compact();
  assert.deepEqual(el.getGridOptions(), { columns: 12, min_columns: 6, rows: 1, min_rows: 1 });
  assert.deepEqual(
    Compact.getConfigForm().schema.map((s: any) => s.name),
    ["entity", "theme", "team_color"],
  );
  assert.deepEqual(Compact.getStubConfig(makeHass()), { entity: IDS.game, theme: "auto" });
  const entry = (window as any).customCards.find((c: any) => c.type === "euroleague-tracker-compact-card");
  assert.equal(entry.name, "EuroLeague Tracker (compact)");
});
