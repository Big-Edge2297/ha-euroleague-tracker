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

type View = "tabs" | "game" | "standings" | "stats" | "round";
type Tab = "game" | "standings" | "stats" | "round";
type StatsTab = "team" | "players" | "shots";

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
  show_round_tab?: boolean;
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
  show_shot_chart: "Show the shot chart after a game",
  show_round_tab: "Show the Round tab",
};

const STAT_LABELS: Record<string, string> = {
  points: "Points",
  rebounds: "Rebounds",
  assists: "Assists",
  steals: "Steals",
  turnovers: "Turnovers",
  blocks: "Blocks",
  pir: "PIR",
  fg2_pct: "2P%",
  fg3_pct: "3P%",
  ft_pct: "FT%",
};

const ZONES: [string, string][] = [
  ["rim", "At the rim"],
  ["paint", "Paint"],
  ["mid_range", "Mid-range"],
  ["corner_three", "Corner three"],
  ["above_break_three", "Above-break three"],
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export class EuroLeagueTrackerCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _tab: { state: true },
    _statsTab: { state: true },
    _round: { state: true },
    _broken: { state: true },
  };

  hass: any;
  private _config!: CardConfig;
  private _tab: Tab = "game";
  private _statsTab: StatsTab = "team";
  private _round: number | null = null;
  private _broken: Set<string> = new Set();

  // ------------------------------------------------------------- HA hooks

  setConfig(config: CardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Choose the game sensor created by EuroLeague Tracker (entity).");
    }
    this._config = {
      view: "tabs",
      theme: "auto",
      play_by_play_rows: 4,
      show_shot_chart: true,
      show_round_tab: true,
      ...config,
    };
    if (this._config.view && this._config.view !== "tabs") this._tab = this._config.view as Tab;
  }

  getCardSize(): number {
    return this._tab === "standings" || this._tab === "stats" ? 12 : this._tab === "round" ? 9 : 8;
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
                ["tabs", "Tabs: game, standings, stats, round"],
                ["game", "Game only"],
                ["standings", "Standings only"],
                ["stats", "Stats only"],
                ["round", "Round scoreboard only"],
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
        {
          type: "grid",
          name: "",
          schema: [
            { name: "show_shot_chart", selector: { boolean: {} } },
            { name: "show_round_tab", selector: { boolean: {} } },
          ],
        },
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
        ${tab === "standings"
          ? this._renderStandings(a)
          : tab === "stats"
            ? this._renderStats(a)
            : tab === "round"
              ? this._renderRound(a)
              : this._renderGame(game.state, a)}
      </div>
    </ha-card>`;
  }

  private _renderTabs() {
    const tabs: [Tab, string][] = [
      ["game", "Game"],
      ["standings", "Standings"],
      ["stats", "Stats"],
    ];
    if (this._config.show_round_tab !== false) tabs.push(["round", "Round"]);
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
      ${state === "PRE" ? this._renderH2H(a) : this._renderFlow(state, a)}
      ${state === "IN" ? this._renderPlays(a) : nothing}
      ${state !== "PRE" ? this._renderPlayers(state, a) : nothing}
      ${state === "POST" ? this._renderBars(a) : nothing}
      ${state === "POST" && this._config.show_shot_chart !== false ? this._renderShots(a) : nothing}
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

  // ------------------------------------------------- head to head, score flow

  private _renderH2H(a: Attrs) {
    const h = a.head_to_head;
    if (!h?.meetings?.length) return nothing;
    const lead =
      h.wins === h.losses
        ? `Level ${h.wins}-${h.losses}`
        : `${h.wins > h.losses ? a.team_abbr : h.opponent_abbr} leads ${Math.max(h.wins, h.losses)}-${Math.min(h.wins, h.losses)}`;
    return html`<div>
      <div class="head" style="margin-bottom:4px">
        <span class="section-title" style="margin:0">Head to head · last ${h.meetings.length}</span>
        <span style="font-size:13px">${lead}</span>
      </div>
      <div class="h2h">
        ${h.meetings.map((m: Attrs) => {
          const [hc, hs, ac, as] =
            m.homeaway === "home"
              ? [a.team_abbr, m.team_score, h.opponent_abbr, m.opponent_score]
              : [h.opponent_abbr, m.opponent_score, a.team_abbr, m.team_score];
          return html`<div class="h2h-row">
            <span class="d">${m.date ? this._fmtDate(m.date) : ""}</span>
            <span
              ><span class=${hs > as ? "w" : "dim"}>${hc} ${hs}</span> – <span class=${as > hs ? "w" : "dim"}
                >${as} ${ac}</span
              ></span
            >
            <span class="chip ${m.won ? "W" : "L"}">${m.won ? "W" : "L"}</span>
          </div>`;
        })}
      </div>
      <div class="foot" style="margin-top:6px">Average margin ${signed(h.average_margin)}</div>
    </div>`;
  }

  private _fmtDate(iso: string): string {
    const { lang, tz } = this._locale();
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric", timeZone: tz }).format(
      new Date(iso),
    );
  }

  private _renderFlow(state: string, a: Attrs) {
    const f = a.score_flow;
    const team: number[] = f?.team ?? [];
    const opp: number[] = f?.opponent ?? [];
    if (team.length < 2) return nothing;
    const diffs = team.map((t, i) => t - (opp[i] ?? 0));
    const minutes = Math.max(40, diffs.length - 1);
    const W = 400;
    const H = 140;
    const up = Math.max(5, ...diffs);
    const down = Math.max(5, ...diffs.map((d) => -d));
    const zero = 8 + ((H - 16) * up) / (up + down);
    const k = (H - 16) / (up + down);
    const x = (m: number) => ((m / minutes) * W).toFixed(1);
    const y = (d: number) => (zero - d * k).toFixed(1);
    const line = diffs.map((d, m) => `${x(m)},${y(d)}`).join(" ");
    const area = `M 0,${zero.toFixed(1)} L ${diffs.map((d, m) => `${x(m)},${y(d)}`).join(" L ")} L ${x(diffs.length - 1)},${zero.toFixed(1)} Z`;
    const quarters = [10, 20, 30, ...(minutes > 40 ? [40] : [])];
    const id = `flow-${a.game_code ?? "x"}`;
    const label = `Score flow: largest ${a.team_abbr} lead ${f.largest_lead ?? 0}, largest ${a.opponent_abbr} lead ${f.largest_deficit ?? 0}`;
    return html`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Score flow</span>
        <span class="legend">
          <span><i style="background:var(--elt-accent)"></i>${a.team_abbr} ahead</span>
          <span><i style="background:var(--elt-other)"></i>${a.opponent_abbr} ahead</span>
        </span>
      </div>
      <svg class="chart" viewBox="0 0 ${W} ${H + 14}" role="img" aria-label=${label}>
        <defs>
          <clipPath id="${id}-up"><rect x="0" y="0" width=${W} height=${zero}></rect></clipPath>
          <clipPath id="${id}-dn"><rect x="0" y=${zero} width=${W} height=${H}></rect></clipPath>
        </defs>
        ${quarters.map((q) => svg`<line class="grid" x1=${x(q)} y1="4" x2=${x(q)} y2=${H - 4}></line>`)}
        <path d=${area} class="area-up" clip-path="url(#${id}-up)"></path>
        <path d=${area} class="area-down" clip-path="url(#${id}-dn)"></path>
        <line class="zero" x1="0" y1=${zero} x2=${W} y2=${zero}></line>
        <polyline class="flow" points=${line}></polyline>
        ${[1, 2, 3, 4].map(
          (q) => svg`<text class="axis" x=${x(q * 10 - 5)} y=${H + 12} text-anchor="middle">Q${q}</text>`,
        )}
      </svg>
      <div class="facts">
        <div class="tile small">
          <div class="k">Biggest lead</div>
          <div class="v">${f.largest_lead ? `+${f.largest_lead} · ${f.largest_lead_minute}'` : "–"}</div>
        </div>
        <div class="tile small">
          <div class="k">${a.opponent_abbr} biggest</div>
          <div class="v">${f.largest_deficit ? `+${f.largest_deficit} · ${f.largest_deficit_minute}'` : "–"}</div>
        </div>
        <div class="tile small">
          <div class="k">${state === "IN" ? "Now" : "Final margin"}</div>
          <div class="v">${signed(diffs[diffs.length - 1])}</div>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------- stats

  private _renderStats(a: Attrs) {
    const st = this._state(this._statsId());
    const at: Attrs = st?.attributes ?? {};
    const pg: Attrs = at.per_game ?? {};
    const standings = this._state(this._standingsId())?.attributes ?? {};
    const row = (standings.table ?? []).find((r: Attrs) => r.code === (a.team_abbr ?? at.team_abbr));
    const right =
      this._statsTab === "shots" && at.shot_zones
        ? `${at.shot_zones.games} games · ${at.shot_zones.attempts} shots`
        : this._statsTab === "players" && row
          ? `${row.wins}-${row.losses} · ${row.position}${ordinalSuffix(row.position)}`
          : pg.games_played
            ? `Per game · ${pg.games_played} GP`
            : "";
    const tabs: [StatsTab, string][] = [
      ["team", "Team"],
      ["players", "Players"],
      ["shots", "Shots"],
    ];
    return html`
      <div class="head">
        <span class="eyebrow">${a.team_name ?? ""} · ${seasonLabel(at.season)}</span>
        <span class="pill">${right}</span>
      </div>
      <div class="subtabs" role="tablist">
        ${tabs.map(
          ([key, label]) =>
            html`<button
              role="tab"
              aria-selected=${this._statsTab === key ? "true" : "false"}
              @click=${() => (this._statsTab = key)}
            >
              ${label}
            </button>`,
        )}
      </div>
      ${this._statsTab === "players"
        ? this._statsPlayers(at)
        : this._statsTab === "shots"
          ? this._statsShots(at)
          : this._statsTeam(at)}
    `;
  }

  private _statsTeam(at: Attrs) {
    const pg: Attrs = at.per_game ?? {};
    const ranks: Attrs = at.league_ranks ?? {};
    const ad: Attrs | null = at.attack_defence ?? null;
    if (!Object.keys(pg).length && !Object.keys(ranks).length) {
      return html`<div class="empty-state">Season stats aren't available yet.</div>`;
    }
    const parts: TemplateResult[] = [];
    if (ad) {
      const vsAvg = (v: number) => `${signed(Math.round((v - ad.league_average) * 10) / 10)} vs avg`;
      const lo = Math.min(ad.allowed, ad.scored, ad.league_average) - 4;
      const hi = Math.max(ad.allowed, ad.scored, ad.league_average) + 4;
      const px = (v: number) => (((v - lo) / (hi - lo)) * 380 + 10).toFixed(1);
      parts.push(html`<div class="facts two">
          <div class="tile">
            <div class="k">Attack</div>
            <div class="v">${ad.scored.toFixed(1)} <span class="unit">scored</span></div>
            <div class="note">${ad.scored_rank}${ordinalSuffix(ad.scored_rank)} · ${vsAvg(ad.scored)}</div>
          </div>
          <div class="tile">
            <div class="k">Defence</div>
            <div class="v">${ad.allowed.toFixed(1)} <span class="unit">allowed</span></div>
            <div class="note">${ad.allowed_rank}${ordinalSuffix(ad.allowed_rank)} · ${vsAvg(ad.allowed)}</div>
          </div>
        </div>
        <div>
          <div class="head" style="margin-bottom:2px">
            <span class="section-title" style="margin:0">Attack vs defence</span>
            <span style="font-size:13px">Net <b>${signed(ad.net)}</b></span>
          </div>
          <svg
            class="chart"
            viewBox="0 0 400 60"
            role="img"
            aria-label=${`Points per game: ${ad.scored} scored, ${ad.allowed} allowed, league average ${ad.league_average}`}
          >
            <line class="track" x1="10" y1="32" x2="390" y2="32"></line>
            <line class="avg" x1=${px(ad.league_average)} y1="20" x2=${px(ad.league_average)} y2="44"></line>
            <text class="axis" x=${px(ad.league_average)} y="58" text-anchor="middle">avg ${ad.league_average}</text>
            <line class="span" x1=${px(ad.allowed)} y1="32" x2=${px(ad.scored)} y2="32"></line>
            <circle class="ring" cx=${px(ad.allowed)} cy="32" r="6"></circle>
            <circle class="dot" cx=${px(ad.scored)} cy="32" r="6"></circle>
            <text class="label" x=${px(ad.allowed)} y="16" text-anchor="middle">${ad.allowed} allowed</text>
            <text class="label" x=${px(ad.scored)} y="16" text-anchor="middle">${ad.scored} scored</text>
          </svg>
        </div>`);
    }
    const keys = Object.keys(STAT_LABELS).filter((k) => ranks[k]);
    if (keys.length) {
      parts.push(html`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">League rank</span>
          <span class="legend">
            <span><i class="round" style="background:var(--elt-accent)"></i>${at.team_abbr ?? "Team"}</span>
            <span><i class="tick"></i>League avg</span>
          </span>
        </div>
        <div class="rankbars">
          ${keys.map((k) => {
            const r = ranks[k];
            const span = r.best - r.worst || 1;
            const pos = Math.max(0, Math.min(100, ((r.value - r.worst) / span) * 100));
            const avg = Math.max(0, Math.min(100, ((r.average - r.worst) / span) * 100));
            const tier = r.rank <= 3 ? "top" : r.rank <= Math.ceil(r.teams / 2) ? "" : "low";
            const digits = k === "pir" ? 0 : 1;
            return html`<span class="k">${STAT_LABELS[k]}</span>
              <span class="v">${Number(r.value).toFixed(digits)}</span>
              <span
                class="rb"
                role="img"
                aria-label=${`${STAT_LABELS[k]} ${r.value}, ${r.rank}${ordinalSuffix(r.rank)} of ${r.teams}`}
                ><span class="t"></span><span class="a" style=${`left:${avg.toFixed(1)}%`}></span
                ><span class="p" style=${`left:${pos.toFixed(1)}%`}></span
              ></span>
              <span class="r ${tier}">${r.rank}${ordinalSuffix(r.rank)}</span>`;
          })}
        </div>
        <div class="foot" style="margin-top:6px">
          Each bar runs from the league's worst to best; turnovers are flipped so right is always better.
        </div>
      </div>`);
    } else if (Object.keys(pg).length) {
      const tile = (k: string, v: any, digits = 1) =>
        html`<div class="tile">
          <div class="k">${k}</div>
          <div class="v">${typeof v === "number" ? v.toFixed(digits) : "–"}</div>
        </div>`;
      parts.push(html`<div class="tiles">
        ${tile("Points", pg.points)} ${tile("Rebounds", pg.rebounds)} ${tile("Assists", pg.assists)}
        ${tile("2P%", pg.fg2_pct)} ${tile("3P%", pg.fg3_pct)} ${tile("PIR", pg.pir, 0)}
      </div>`);
    }
    return parts;
  }

  private _statsPlayers(at: Attrs) {
    const form: Attrs[] = at.form ?? [];
    const ranks: Attrs[] = at.team_leader_ranks ?? [];
    const league: Attrs = at.league_leaders ?? {};
    const parts: TemplateResult[] = [];
    if (form.length) {
      const W = 400;
      // Room above for the biggest win, below for the biggest loss (labels included).
      const up = Math.max(5, ...form.map((g) => g.margin));
      const down = Math.max(5, ...form.map((g) => -g.margin));
      const k = 110 / (up + down);
      const mid = 16 + up * k;
      const H = mid + down * k + 16;
      const bw = W / form.length;
      const avg = form.reduce((s, g) => s + g.margin, 0) / form.length;
      const showOpp = form.length <= 20;
      parts.push(html`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season form · point margin</span>
          <span style="font-size:13px">Avg <b>${signed(Math.round(avg * 10) / 10)}</b></span>
        </div>
        <svg
          class="chart"
          viewBox="0 0 ${W} ${H + (showOpp ? 14 : 0)}"
          role="img"
          aria-label=${`Point margin in ${form.length} games: ${form.filter((g) => g.margin > 0).length} wins, ${form.filter((g) => g.margin < 0).length} losses`}
        >
          <line class="zero" x1="0" y1=${mid} x2=${W} y2=${mid}></line>
          ${form.map((g, i) => {
            const h = Math.max(1.5, Math.abs(g.margin) * k);
            const x = i * bw + bw * 0.15;
            const w = bw * 0.7;
            const top = g.margin > 0 ? mid - h : mid;
            const cx = x + w / 2;
            return svg`<rect class=${g.margin > 0 ? "win" : "loss"} x=${x.toFixed(1)} y=${top.toFixed(1)} width=${w.toFixed(1)} height=${h.toFixed(1)} rx="2"><title>${`R${g.round} ${g.homeaway === "home" ? "vs" : "@"} ${g.opponent_abbr} ${g.team_score}-${g.opponent_score}`}</title></rect>
              ${form.length <= 24 ? svg`<text class="val" x=${cx.toFixed(1)} y=${(g.margin > 0 ? top - 4 : top + h + 11).toFixed(1)} text-anchor="middle">${signed(g.margin)}</text>` : nothing}
              ${showOpp ? svg`<text class="axis" x=${cx.toFixed(1)} y=${H + 12} text-anchor="middle">${g.opponent_abbr}</text>` : nothing}`;
          })}
        </svg>
      </div>`);
    }
    if (ranks.length) {
      parts.push(html`<div>
        <div class="section-title">Your players in the league leaders</div>
        <div class="leaders">
          ${ranks.slice(0, 6).map((r) => {
            const top = league[r.category]?.[0];
            const sub =
              r.rank === 1 || !top
                ? "League leader"
                : `Leader: ${top.name} (${top.team}) ${top.value}`;
            return html`<div class="leader">
              ${r.image && !this._broken.has(r.image)
                ? html`<img
                    class="head-shot"
                    src=${r.image}
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error=${() => (this._broken = new Set([...this._broken, r.image]))}
                  />`
                : html`<span class="head-shot fallback" aria-hidden="true">${initials(r.name)}</span>`}
              <span class="who"
                ><b>${r.name}</b><span>${STAT_LABELS[r.category] ?? titleCase(r.category)} · ${sub}</span></span
              >
              <span class="num"
                ><b>${r.value}</b><span class="rank ${r.rank <= 3 ? "top" : ""}"
                  >${r.rank}${ordinalSuffix(r.rank)}</span
                ></span
              >
            </div>`;
          })}
        </div>
      </div>`);
    }
    return parts.length ? parts : html`<div class="empty-state">No games played yet.</div>`;
  }

  private _statsShots(at: Attrs) {
    const z: Attrs | null = at.shot_zones ?? null;
    if (!z?.zones) return html`<div class="empty-state">Shot locations aren't available yet.</div>`;
    const pps = (k: string) => z.zones[k]?.points_per_shot ?? 0;
    // Darker = more points per shot (0.8 .. 1.65 covers EuroLeague zones).
    const shade = (k: string) => (0.15 + 0.75 * Math.max(0, Math.min(1, (pps(k) - 0.8) / 0.85))).toFixed(2);
    const pct = (k: string) => (z.zones[k]?.pct == null ? "–" : `${Math.round(z.zones[k].pct)}%`);
    const tag = (x: number, y: number, k: string, label: string) => svg`<g>
        <rect class="tag" x=${x - 120} y=${y - 58} width="240" height="96" rx="18"></rect>
        <text class="tag-v" x=${x} y=${y - 12} text-anchor="middle">${pct(k)}</text>
        <text class="tag-k" x=${x} y=${y + 26} text-anchor="middle">${z.zones[k]?.made ?? 0}/${z.zones[k]?.attempts ?? 0} · ${label}</text>
      </g>`;
    const arc = "M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157 Z";
    const label = ZONES.map(([k, l]) => `${l} ${pct(k)}`).join(", ");
    return html`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season shooting by zone</span>
          <span style="font-size:13px">${z.made}/${z.attempts} FG · ${z.pct}%</span>
        </div>
        <svg class="court zones" viewBox="-760 -170 1520 1150" role="img" aria-label=${`Season shooting by zone: ${label}`}>
          <defs><clipPath id="elt-court"><rect x="-750" y="-157" width="1500" height="1130"></rect></clipPath></defs>
          <g clip-path="url(#elt-court)">
            <rect class="z" x="-750" y="-157" width="1500" height="1130" style=${`fill-opacity:${shade("above_break_three")}`}></rect>
            <path class="bg" d=${arc}></path>
            <path class="z" d=${arc} style=${`fill-opacity:${shade("mid_range")}`}></path>
            <rect class="bg" x="-750" y="-157" width="90" height="298.5"></rect>
            <rect class="bg" x="660" y="-157" width="90" height="298.5"></rect>
            <rect class="z" x="-750" y="-157" width="90" height="298.5" style=${`fill-opacity:${shade("corner_three")}`}></rect>
            <rect class="z" x="660" y="-157" width="90" height="298.5" style=${`fill-opacity:${shade("corner_three")}`}></rect>
            <rect class="bg" x="-245" y="-157" width="490" height="580"></rect>
            <rect class="z" x="-245" y="-157" width="490" height="580" style=${`fill-opacity:${shade("paint")}`}></rect>
            <circle class="bg" cx="0" cy="0" r="125"></circle>
            <circle class="z" cx="0" cy="0" r="125" style=${`fill-opacity:${shade("rim")}`}></circle>
            <g class="zone-lines">
              <rect x="-245" y="-157" width="490" height="580"></rect>
              <path d="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157"></path>
              <circle cx="0" cy="0" r="125"></circle>
              <circle cx="0" cy="423" r="180"></circle>
              <line x1="-90" y1="-37" x2="90" y2="-37"></line>
              <circle cx="0" cy="0" r="23"></circle>
            </g>
          </g>
          ${tag(0, 60, "rim", "rim")} ${tag(0, 330, "paint", "paint")} ${tag(-450, 330, "mid_range", "mid")}
          ${tag(0, 820, "above_break_three", "above break")}
        </svg>
        <div class="shot-legend">
          <span>Darker = more points per shot</span>
          <span class="sum">Corners: ${z.zones.corner_three?.made ?? 0}/${z.zones.corner_three?.attempts ?? 0} · ${pct("corner_three")}</span>
        </div>
      </div>
      <div class="zone-table">
        <span></span><span class="h">Zone</span><span class="h r">FG</span><span class="h r">%</span
        ><span class="h r">Pts/shot</span>
        ${ZONES.map(
          ([k, l]) => html`<span class="sw" style=${`opacity:${shade(k)}`}></span><span>${l}</span
            ><span class="r dim">${z.zones[k]?.made ?? 0}/${z.zones[k]?.attempts ?? 0}</span
            ><b class="r">${z.zones[k]?.pct == null ? "–" : `${z.zones[k].pct.toFixed(1)}%`}</b
            ><span class="r dim">${z.zones[k]?.points_per_shot?.toFixed(2) ?? "–"}</span>`,
        )}
      </div>`;
  }

  // ---------------------------------------------------------------- round

  private _renderRound(a: Attrs) {
    const st = this._state(this._standingsId())?.attributes ?? {};
    const board: Attrs = st.scoreboard ?? {};
    const rounds: Attrs[] = board.rounds ?? [];
    if (!rounds.length) return html`<div class="empty-state">The round's games aren't available yet.</div>`;
    const me = a.team_abbr ?? st.team_abbr;
    const fallback = rounds.find((r) => r.round === a.round) ?? rounds[Math.floor(rounds.length / 2)];
    const current = rounds.find((r) => r.round === this._round) ?? fallback;
    const i = rounds.indexOf(current);
    const played = current.games.filter((g: Attrs) => g.played).length;
    const status = played === current.games.length ? "results" : played ? "in progress" : "fixtures";
    const crest = (code: string) => {
      const url = board.crests?.[code];
      return url && !this._broken.has(url)
        ? html`<img
            class="mini-crest"
            src=${url}
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            @error=${() => (this._broken = new Set([...this._broken, url]))}
          />`
        : html`<span class="mini-crest fallback" aria-hidden="true"></span>`;
    };
    const side = (code: string, score: number | null, win: boolean, g: Attrs) =>
      html`<div class="side ${g.played && !win ? "dim" : ""} ${g.played && win ? "w" : ""}">
        ${crest(code)}<span class="c">${code}</span><span class="s">${g.played ? score : ""}</span>
      </div>`;
    const arrow = (dir: -1 | 1) => {
      const target = rounds[i + dir];
      return html`<button
        class="nav"
        aria-label=${dir < 0 ? "Previous round" : "Next round"}
        ?disabled=${!target}
        @click=${() => target && (this._round = target.round)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d=${dir < 0 ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}></path>
        </svg>
      </button>`;
    };
    return html`
      <div class="head">
        <div class="round-nav">
          ${arrow(-1)}<span class="round-title">Round ${current.round} · ${status}</span>${arrow(1)}
        </div>
        <span class="pill">${current.games.length} games</span>
      </div>
      <div class="board">
        ${current.games.map((g: Attrs) => {
          const mine = g.home === me || g.away === me;
          const hw = (g.home_score ?? 0) > (g.away_score ?? 0);
          return html`<div class="bgame ${mine ? "me" : ""}">
            ${side(g.home, g.home_score, hw, g)} ${side(g.away, g.away_score, !hw, g)}
            ${g.played || !g.date ? nothing : html`<div class="when-s">${this._fmtDay(g.date)} · ${this._fmtTime(g.date)}</div>`}
          </div>`;
        })}
      </div>
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
