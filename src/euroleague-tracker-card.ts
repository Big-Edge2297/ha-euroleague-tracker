import { LitElement, html, nothing, svg, type PropertyValues, type TemplateResult } from "lit";

import { ordinalSuffix, seasonLabel, signed, titleCase } from "./format";
import { styles } from "./styles";
import { themeVars, type ThemeName } from "./theme";

// The integration loads the card as ".../euroleague-tracker-card.js?v=<version>".
const CARD_VERSION = (() => {
  try {
    return new URL(import.meta.url).searchParams.get("v") ?? "dev";
  } catch {
    return "dev";
  }
})();
const ATTRIBUTION_PREFIX = "Data provided by the EuroLeague API";

type View = "tabs" | "game" | "standings" | "stats";
type Tab = "game" | "standings" | "stats";

interface CardConfig {
  type: string;
  entity: string;
  standings_entity?: string;
  stats_entity?: string;
  view?: View;
  theme?: ThemeName;
  team_color?: string;
  play_by_play_rows?: number;
  standings_rows?: number;
  show_shot_chart?: boolean;
}

type Attrs = Record<string, any>;

const LABELS: Record<string, string> = {
  entity: "Game sensor",
  view: "What to show",
  theme: "Theme",
  team_color: "Team colour (hex, optional)",
  play_by_play_rows: "Play-by-play rows",
  standings_rows: "Standings rows",
  standings_entity: "Standings sensor (optional, found automatically)",
  stats_entity: "Stats sensor (optional, found automatically)",
  show_shot_chart: "Show shot chart",
};

export class EuroLeagueTrackerCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _tab: { state: true },
    _broken: { state: true },
  };

  hass: any;
  private _config!: CardConfig;
  private _tab: Tab = "game";
  private _broken: Set<string> = new Set();

  // ------------------------------------------------------------- HA hooks

  setConfig(config: CardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Choose the game sensor created by EuroLeague Tracker (entity).");
    }
    this._config = { view: "tabs", theme: "auto", play_by_play_rows: 4, show_shot_chart: true, ...config };
    if (this._config.view && this._config.view !== "tabs") this._tab = this._config.view as Tab;
  }

  getCardSize(): number {
    return this._tab === "standings" ? 12 : 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  static getConfigForm() {
    const select = (options: [string, string][]) => ({
      select: { mode: "dropdown", options: options.map(([value, label]) => ({ value, label })) },
    });
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "sensor", integration: "euroleague_tracker" } } },
        {
          type: "grid",
          name: "",
          schema: [
            {
              name: "view",
              selector: select([
                ["tabs", "Tabs: game, standings, stats"],
                ["game", "Game only"],
                ["standings", "Standings only"],
                ["stats", "Stats only"],
              ]),
            },
            {
              name: "theme",
              selector: select([
                ["auto", "Follow Home Assistant theme"],
                ["dark", "Dark"],
                ["light", "Light"],
                ["team", "Team colours"],
              ]),
            },
          ],
        },
        { name: "team_color", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "play_by_play_rows", selector: { number: { min: 0, max: 10, mode: "box" } } },
            { name: "standings_rows", selector: { number: { min: 4, max: 20, mode: "box" } } },
          ],
        },
        { name: "show_shot_chart", selector: { boolean: {} } },
        { name: "standings_entity", selector: { entity: { domain: "sensor", integration: "euroleague_tracker" } } },
        { name: "stats_entity", selector: { entity: { domain: "sensor", integration: "euroleague_tracker" } } },
      ],
      computeLabel: (s: { name: string }) => LABELS[s.name] ?? s.name,
    };
  }

  static getStubConfig(hass: any): Partial<CardConfig> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => {
      const a = hass.states[id].attributes ?? {};
      return id.startsWith("sensor.") && String(a.attribution ?? "").startsWith(ATTRIBUTION_PREFIX) && "game_code" in a;
    });
    return { entity: entity ?? "", view: "tabs", theme: "auto" };
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!changed.has("hass") || changed.size > 1) return true;
    const old = changed.get("hass");
    if (!old) return true;
    return [this._config.entity, this._standingsId(), this._statsId()].some(
      (id) => id && old.states[id] !== this.hass.states[id],
    );
  }

  // ------------------------------------------------------------- helpers

  private _state(id?: string) {
    return id ? this.hass?.states?.[id] : undefined;
  }

  private _findSibling(suffix: string, marker: string): string | undefined {
    const base = this._config.entity.replace(/_game$/, "");
    const guess = `${base}${suffix}`;
    if (this._state(guess)) return guess;
    const team = this._state(this._config.entity)?.attributes?.team_abbr;
    return Object.keys(this.hass?.states ?? {}).find((id) => {
      const a = this.hass.states[id].attributes ?? {};
      return id.startsWith("sensor.") && marker in a && a.team_abbr === team && a.competition !== undefined;
    });
  }

  private _standingsId() {
    return this._config.standings_entity || this._findSibling("_standings_position", "table");
  }

  private _statsId() {
    return this._config.stats_entity || this._findSibling("_season_stats", "per_game");
  }

  private _teamColor(a: Attrs): string {
    const c = this._config.team_color || a.team_color || a.team_colors?.[0];
    return /^#[0-9a-f]{3,8}$/i.test(String(c ?? "")) ? c : "#C62828";
  }

  private _locale() {
    const lang = this.hass?.locale?.language || this.hass?.language || "en";
    const tz = this.hass?.locale?.time_zone === "local" ? undefined : this.hass?.config?.time_zone;
    const tf = this.hass?.locale?.time_format;
    return { lang, tz, hour12: tf === "12" ? true : tf === "24" ? false : undefined };
  }

  private _fmtDay(iso: string): string {
    const { lang, tz } = this._locale();
    return new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(
      new Date(iso),
    );
  }

  private _fmtTime(iso: string): string {
    const { lang, tz, hour12 } = this._locale();
    return new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit", timeZone: tz, hour12 }).format(
      new Date(iso),
    );
  }

  private _crest(url: string | null | undefined, code: string, cls = "crest"): TemplateResult {
    if (!url || this._broken.has(url)) {
      return html`<div class="crest-fallback" role="img" aria-label=${code}>${code}</div>`;
    }
    // A light disc behind the crest keeps dark crests (ASVEL, Partizan…) visible on dark backgrounds.
    return html`<span class="plate ${cls ? "" : "small"}"
      ><img
        class=${cls}
        src=${url}
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error=${() => {
          this._broken = new Set([...this._broken, url]);
        }}
    /></span>`;
  }

  private _form(form: string[] | undefined, small = false) {
    if (!form?.length) return nothing;
    return html`<span class="form" aria-label=${`Last ${form.length}, oldest first: ${form.join(" ")}`}>
      ${form.map((r) => html`<span class="chip ${r} ${small ? "small" : ""}">${r}</span>`)}
    </span>`;
  }

  // -------------------------------------------------------------- render

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const game = this._state(this._config.entity);
    if (!game) {
      return html`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;
    }
    const a: Attrs = game.attributes ?? {};
    const theme = (this._config.theme ?? "auto") as ThemeName;
    const vars = themeVars(theme, this._teamColor(a));
    const style = Object.entries(vars)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
    const tab: Tab = this._config.view === "tabs" ? this._tab : (this._config.view as Tab) ?? "game";

    return html`<ha-card style=${style}>
      ${theme === "team" && a.team_logo && !this._broken.has(a.team_logo)
        ? html`<img
            class="watermark"
            src=${a.team_logo}
            alt=""
            referrerpolicy="no-referrer"
            @error=${() => (this._broken = new Set([...this._broken, a.team_logo]))}
          />`
        : nothing}
      <div class="content">
        ${this._config.view === "tabs" ? this._renderTabs() : nothing}
        ${tab === "standings" ? this._renderStandings(a) : tab === "stats" ? this._renderStats(a) : this._renderGame(game.state, a)}
      </div>
    </ha-card>`;
  }

  private _renderTabs() {
    const tabs: [Tab, string][] = [
      ["game", "Game"],
      ["standings", "Standings"],
      ["stats", "Stats"],
    ];
    return html`<div class="tabs" role="tablist">
      ${tabs.map(
        ([key, label]) =>
          html`<button role="tab" aria-selected=${this._tab === key ? "true" : "false"} @click=${() => (this._tab = key)}>
            ${label}
          </button>`,
      )}
    </div>`;
  }

  // ---------------------------------------------------------------- game

  private _renderGame(state: string, a: Attrs) {
    if (state === "NOT_FOUND" || !a.team_abbr) {
      return html`<div class="empty-state">${a.api_message ?? "No game found for this team."}</div>`;
    }
    const competition = a.competition ?? "EuroLeague";
    const round = a.round_name ?? (a.round ? `Round ${a.round}` : "");
    let pill: TemplateResult;
    if (state === "IN") {
      pill = html`<span class="pill live"><span class="dot"></span>LIVE${a.clock ? ` · ${a.clock}` : ""}</span>`;
    } else if (state === "POST") {
      const won = a.team_winner === true;
      pill = html`<span class="pill ${won ? "win" : "loss"}">${a.clock ?? "Final"} · ${won ? "W" : "L"}</span>`;
    } else {
      pill = html`<span class="pill">${a.kickoff_in ?? ""}</span>`;
    }

    return html`
      <div class="head">
        <span class="eyebrow">${competition}${round ? ` · ${round}` : ""}</span>
        ${pill}
      </div>
      ${this._renderMatchup(state, a)}
      ${state === "PRE" ? this._renderPreCompare(a) : this._renderQuarters(state, a)}
      ${state === "IN" ? this._renderPlays(a) : nothing}
      ${state !== "PRE" ? this._renderPlayers(state, a) : nothing}
      ${state === "POST" ? this._renderBars(a) : nothing}
      ${this._renderFoot(state, a)}
    `;
  }

  private _side(a: Attrs, who: "team" | "opponent") {
    return {
      code: a[`${who}_abbr`],
      name: a[`${who}_name`],
      logo: a[`${who}_logo`],
      record: a[`${who}_record`],
      position: a[`${who}_position`],
      homeaway: a[`${who}_homeaway`],
      score: a[`${who}_score`],
    };
  }

  private _renderMatchup(state: string, a: Attrs) {
    // Home team on the left, like the scoreboard.
    const us = this._side(a, "team");
    const them = this._side(a, "opponent");
    const [left, right] = us.homeaway === "away" ? [them, us] : [us, them];
    const sub = (s: ReturnType<typeof this._side>) => {
      if (state === "PRE") {
        const pos = s.position ? `${s.position}${ordinalSuffix(s.position)}` : null;
        return [pos, s.record].filter(Boolean).join(" · ");
      }
      return [s.record, s.homeaway === "home" ? "Home" : "Away"].filter(Boolean).join(" · ");
    };
    const teamBlock = (s: ReturnType<typeof this._side>) => html`<div class="team">
      ${this._crest(s.logo, s.code)}
      <div class="team-name" title=${s.name}>${s.name}</div>
      <div class="team-sub">${sub(s)}</div>
    </div>`;

    let middle: TemplateResult;
    if (state === "PRE" && a.date) {
      middle = html`<div class="when">
        <span class="day">${this._fmtDay(a.date)}</span>
        <span class="time">${this._fmtTime(a.date)}</span>
      </div>`;
    } else {
      const l = left.score ?? 0;
      const r = right.score ?? 0;
      middle = html`<div class="score" aria-label=${`${left.name} ${l}, ${right.name} ${r}`}>
        <span class=${l < r ? "trailing" : ""}>${l}</span><span class="sep">–</span><span class=${r < l ? "trailing" : ""}
          >${r}</span
        >
      </div>`;
    }
    return html`<div class="matchup">${teamBlock(left)}${middle}${teamBlock(right)}</div>`;
  }

  private _renderQuarters(state: string, a: Attrs) {
    const qs = a.quarter_scores;
    if (!qs?.team?.length && !qs?.opponent?.length) return nothing;
    const n = Math.max(4, qs.team?.length ?? 0, qs.opponent?.length ?? 0);
    const labels = Array.from({ length: n }, (_, i) => (i < 4 ? `Q${i + 1}` : n > 5 ? `OT${i - 3}` : "OT"));
    const current = state === "IN" ? (a.quarter ?? 0) - 1 : -1;
    const us = this._side(a, "team");
    const them = this._side(a, "opponent");
    const rows = us.homeaway === "away" ? [[them, qs.opponent], [us, qs.team]] : [[us, qs.team], [them, qs.opponent]];
    const cols = `grid-template-columns: 1.3fr repeat(${n}, minmax(0, 1fr))`;
    return html`<div class="panel quarters" style=${cols}>
      <span></span>
      ${labels.map((l, i) => html`<span class="label ${i === current ? "current" : ""}">${l}</span>`)}
      ${rows.map(
        ([side, vals]: any) => html`<span class="name">${side.code}</span>
          ${labels.map((_, i) =>
            vals?.[i] === undefined || vals?.[i] === null
              ? html`<span class="empty">–</span>`
              : html`<span class=${i === current ? "current" : ""}>${vals[i]}</span>`,
          )}`,
      )}
    </div>`;
  }

  private _renderPreCompare(a: Attrs) {
    const table: Attrs[] = this._state(this._standingsId())?.attributes?.table ?? [];
    const row = (code: string) => table.find((r) => r.code === code) ?? {};
    const us = this._side(a, "team");
    const them = this._side(a, "opponent");
    const [left, right] = us.homeaway === "away" ? [them, us] : [us, them];
    const L = row(left.code);
    const R = row(right.code);
    const leftForm = L.last5 ?? (left === us ? a.team_form : a.opponent_form);
    const rightForm = R.last5 ?? (right === us ? a.team_form : a.opponent_form);
    if (!leftForm && !table.length) return nothing;
    return html`<div class="panel compare">
      ${this._form(leftForm)}<span class="mid">Last 5</span><span class="r">${this._form(rightForm)}</span>
      ${table.length
        ? html`<span>${L.home_record ?? "–"}</span><span class="mid">Home / Away</span
            ><span class="r">${R.away_record ?? "–"}</span> <span>${L.last10 ?? "–"}</span><span class="mid">Last 10</span
            ><span class="r">${R.last10 ?? "–"}</span> <span>${signed(L.point_diff)}</span><span class="mid">Point diff</span
            ><span class="r">${signed(R.point_diff)}</span>`
        : nothing}
    </div>`;
  }

  private _renderPlays(a: Attrs) {
    const rows = this._config.play_by_play_rows ?? 4;
    const plays: Attrs[] = (a.play_by_play ?? []).slice(0, rows);
    if (!rows || !plays.length) return nothing;
    return html`<div>
      <div class="section-title">Play-by-play</div>
      <div class="plays">
        ${plays.map(
          (p) => html`<div class="play ${p.scoring ? "scoring" : ""}">
            <span class="t">${p.clock ?? ""}</span><span class="text">${p.text}</span
            ><span class="sc">${p.scoring && p.score ? p.score : ""}</span>
          </div>`,
        )}
      </div>
    </div>`;
  }

  private _renderPlayers(state: string, a: Attrs) {
    const players: Attrs[] = a.top_players?.team ?? [];
    if (!players.length) return nothing;
    const list = players.slice(0, state === "IN" ? 3 : 4);
    return html`<div>
      <div class="section-title">${state === "IN" ? "Leaders" : "Top performers"} (PIR)</div>
      <div class="players">
        <span class="h">Player</span><span class="h">PTS</span><span class="h">REB</span><span class="h">AST</span
        ><span class="h">PIR</span>
        ${list.map(
          (p) => html`<span class="pname"><b>${p.name}</b> <span class="num">#${p.number}</span></span>
            <span class="n">${p.points ?? "–"}</span><span class="n">${p.rebounds ?? "–"}</span
            ><span class="n">${p.assists ?? "–"}</span><span class="n">${p.pir ?? "–"}</span>`,
        )}
      </div>
    </div>`;
  }

  private _renderBars(a: Attrs) {
    const t = a.game_stats?.team;
    const o = a.game_stats?.opponent;
    if (!t || !o) return nothing;
    // [label, ours, theirs, tooltip, decimals]
    const rows: [string, any, any, string, number][] = [
      ["2P%", t.fg2_pct, o.fg2_pct, `${t.fg2} vs ${o.fg2}`, 1],
      ["3P%", t.fg3_pct, o.fg3_pct, `${t.fg3} vs ${o.fg3}`, 1],
      ["FT%", t.ft_pct, o.ft_pct, `${t.ft} vs ${o.ft}`, 1],
      ["Rebounds", t.rebounds, o.rebounds, "", 0],
      ["Assists", t.assists, o.assists, "", 0],
      ["Turnovers", t.turnovers, o.turnovers, "", 0],
    ];
    const valid = rows.filter(([, x, y]) => typeof x === "number" && typeof y === "number");
    if (!valid.length) return nothing;
    return html`<div>
      <div class="section-title">${a.team_abbr} vs ${a.opponent_abbr}</div>
      <div class="bars">
        ${valid.map(([label, x, y, title, digits]) => {
          const share = x + y > 0 ? (100 * x) / (x + y) : 50;
          return html`<span class="l">${x.toFixed(digits)}</span>
            <div title=${title}>
              <div class="bar-label">${label}</div>
              <div class="bar"><span class="us" style=${`width:${share.toFixed(1)}%`}></span><span class="them"></span></div>
            </div>
            <span>${y.toFixed(digits)}</span>`;
        })}
      </div>
    </div>`;
  }

  private _renderFoot(state: string, a: Attrs) {
    const parts: string[] = [];
    if (a.venue) parts.push(titleCase(a.venue));
    if (state !== "PRE" && a.attendance) parts.push(`${Number(a.attendance).toLocaleString(this._locale().lang)} fans`);
    if (state === "PRE" && a.capacity) parts.push(`cap. ${Number(a.capacity).toLocaleString(this._locale().lang)}`);
    if (state === "IN" && (a.team_fouls ?? null) !== null) parts.push(`Fouls ${a.team_fouls}–${a.opponent_fouls}`);
    if (state === "POST" && a.next_game?.date) {
      parts.push(`Next: ${a.next_game.homeaway === "home" ? "vs" : "@"} ${a.next_game.opponent_abbr}, ${this._fmtDay(a.next_game.date)}`);
    }
    return parts.length ? html`<div class="foot">${parts.join(" · ")}</div>` : nothing;
  }

  // ----------------------------------------------------------- standings

  private _renderStandings(a: Attrs) {
    const st = this._state(this._standingsId());
    const table: Attrs[] = st?.attributes?.table ?? [];
    if (!table.length) return html`<div class="empty-state">Standings aren't available yet.</div>`;
    const me = a.team_abbr ?? st?.attributes?.team_abbr;
    let rows = table;
    const limit = this._config.standings_rows;
    if (limit && limit < table.length) {
      const idx = Math.max(0, table.findIndex((r) => r.code === me));
      const start = Math.min(Math.max(0, idx - Math.floor(limit / 2)), table.length - limit);
      rows = table.slice(start, start + limit);
    }
    return html`
      <div class="head">
        <span class="eyebrow">${st?.attributes?.competition ?? "EuroLeague"} standings</span>
        <span class="pill">${st?.attributes?.round ? `After round ${st.attributes.round}` : ""}</span>
      </div>
      <div class="standings" role="table">
        <div class="srow header" role="row">
          <span>#</span><span>Team</span><span class="num">W-L</span><span class="num">+/−</span
          ><span class="num">Last 5</span>
        </div>
        ${rows.map(
          (r) => html`<div class="srow ${r.code === me ? "me" : ""}" role="row">
            <span class="pos ${r.zone ?? ""}">${r.position}</span>
            <span class="tn">${r.crest && !this._broken.has(r.crest) ? this._crest(r.crest, r.code, "") : nothing}<span
                >${r.name}</span
              ></span>
            <span class="num">${r.wins}-${r.losses}</span>
            <span class="num">${signed(r.point_diff)}</span>
            ${this._form(r.last5, true)}
          </div>`,
        )}
      </div>
      <div class="legend">
        <span><i style="background:var(--elt-zone-playoffs)"></i>Playoffs (1–6)</span>
        <span><i style="background:var(--elt-zone-playin)"></i>Play-in (7–10)</span>
      </div>
    `;
  }

  // --------------------------------------------------------------- stats

  private _renderStats(a: Attrs) {
    const st = this._state(this._statsId());
    const pg: Attrs = st?.attributes?.per_game ?? {};
    const ranks: Attrs[] = st?.attributes?.team_leader_ranks ?? [];
    const league: Attrs = st?.attributes?.league_leaders ?? {};
    const tile = (k: string, v: any, digits = 1) =>
      html`<div class="tile">
        <div class="k">${k}</div>
        <div class="v">${typeof v === "number" ? v.toFixed(digits) : "–"}</div>
      </div>`;
    const catName: Record<string, string> = {
      points: "Points",
      rebounds: "Rebounds",
      assists: "Assists",
      pir: "PIR",
      steals: "Steals",
      blocks: "Blocks",
    };
    const leaderLine = ["points", "rebounds", "assists"]
      .map((c) => league[c]?.[0] && `${catName[c]}: ${league[c][0].name} (${league[c][0].team}) ${league[c][0].value}`)
      .filter(Boolean)
      .join(" · ");

    return html`
      <div class="head">
        <span class="eyebrow">${a.team_name ?? ""} · ${seasonLabel(st?.attributes?.season)}</span>
        <span class="pill">${pg.games_played ? `${pg.games_played} games` : ""}</span>
      </div>
      ${Object.keys(pg).length
        ? html`<div class="tiles">
            ${tile("Points", pg.points)} ${tile("Rebounds", pg.rebounds)} ${tile("Assists", pg.assists)}
            ${tile("2P%", pg.fg2_pct)} ${tile("3P%", pg.fg3_pct)} ${tile("PIR", pg.pir, 0)}
            ${tile("Steals", pg.steals)} ${tile("Turnovers", pg.turnovers)} ${tile("FT%", pg.ft_pct)}
          </div>`
        : html`<div class="empty-state">Season stats aren't available yet.</div>`}
      ${ranks.length
        ? html`<div>
            <div class="section-title">League leaders · your players</div>
            <div class="ranks">
              ${ranks.slice(0, 5).map(
                (r) => html`<span><b>${r.name}</b></span><span class="cat">${catName[r.category] ?? r.category}</span
                  ><span><span class="rank">${r.rank}${ordinalSuffix(r.rank)}</span> · ${r.value}</span>`,
              )}
            </div>
            ${leaderLine ? html`<div class="foot" style="margin-top:6px">${leaderLine}</div>` : nothing}
          </div>`
        : nothing}
      ${this._config.show_shot_chart !== false ? this._renderShots(a) : nothing}
    `;
  }

  private _renderShots(a: Attrs) {
    const shots: number[][] = a.shots?.team ?? [];
    if (!shots.length) return nothing;
    const made = shots.filter((s) => s[2]).length;
    const two = shots.filter((s) => s[3] === 2);
    const three = shots.filter((s) => s[3] === 3);
    const sum = (xs: number[][]) => `${xs.filter((s) => s[2]).length}/${xs.length}`;
    const label = `${a.team_name} shot chart vs ${a.opponent_name}: ${made} of ${shots.length} field goals, ${sum(two)} twos, ${sum(three)} threes`;
    return html`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Shot chart · ${a.team_homeaway === "away" ? "@" : "vs"} ${a.opponent_abbr}</span>
        <span style="font-size:13px">${made}/${shots.length} FG</span>
      </div>
      <svg class="court" viewBox="-760 -170 1520 1420" role="img" aria-label=${label}>
        <g class="lines">
          <rect x="-750" y="-157" width="1500" height="1400"></rect>
          <rect x="-245" y="-157" width="490" height="580"></rect>
          <circle cx="0" cy="423" r="180"></circle>
          <path d="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157"></path>
          <line x1="-90" y1="-37" x2="90" y2="-37"></line>
          <circle cx="0" cy="0" r="23"></circle>
          <path d="M -180 1243 A 180 180 0 0 1 180 1243"></path>
        </g>
        ${shots.map(([x, y, m]) =>
          m
            ? svg`<circle class="made" cx=${x} cy=${y} r="26"></circle>`
            : svg`<circle class="miss" cx=${x} cy=${y} r="22"></circle>`,
        )}
      </svg>
      <div class="shot-legend">
        <span><span class="m"></span>Made</span><span><span class="x"></span>Missed</span>
        <span class="sum">2P ${sum(two)} · 3P ${sum(three)}</span>
      </div>
    </div>`;
  }
}

if (!customElements.get("euroleague-tracker-card")) {
  customElements.define("euroleague-tracker-card", EuroLeagueTrackerCard);
}

(window as any).customCards = (window as any).customCards || [];
if (!(window as any).customCards.some((c: any) => c.type === "euroleague-tracker-card")) {
  (window as any).customCards.push({
    type: "euroleague-tracker-card",
    name: "EuroLeague Tracker",
    description: "Live score, next game, standings and stats for your EuroLeague team.",
    preview: true,
    documentationURL: "https://github.com/Big-Edge2297/ha-euroleague-tracker",
  });
}

console.info(`%c EUROLEAGUE-TRACKER-CARD %c ${CARD_VERSION} `, "background:#C62828;color:#fff", "");
