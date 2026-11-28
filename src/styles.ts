import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    container-type: inline-size;
  }
  ha-card,
  .card {
    position: relative;
    overflow: hidden;
    background: var(--elt-bg);
    color: var(--elt-fg);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  }
  .watermark {
    position: absolute;
    right: -40px;
    bottom: -40px;
    width: 220px;
    height: 220px;
    object-fit: contain;
    opacity: 0.1;
    pointer-events: none;
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .tabs {
    display: flex;
    gap: 4px;
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 3px;
  }
  .tabs button {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--elt-fg2);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    min-height: 34px;
    border-radius: 8px;
    cursor: pointer;
  }
  .tabs button[aria-selected="true"] {
    background: var(--elt-bg);
    color: var(--elt-fg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  }
  .tabs button:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .eyebrow {
    font-size: 12px;
    color: var(--elt-fg2);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--elt-surface);
    color: var(--elt-fg);
    white-space: nowrap;
  }
  .pill.live,
  .pill.countdown {
    background: var(--elt-accent);
    color: var(--elt-accent-fg);
  }
  .compare .lead {
    font-weight: 700;
    color: var(--elt-fg);
  }
  .compare .trail {
    color: var(--elt-fg2);
  }
  .compare .lead .chip,
  .compare .trail .chip {
    font-weight: 700;
  }
  .pill.live .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 1.6s ease-in-out infinite;
  }
  .pill.win {
    background: var(--elt-win-bg);
    color: var(--elt-win-fg);
  }
  .pill.loss {
    background: var(--elt-loss-bg);
    color: var(--elt-loss-fg);
  }
  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pill.live .dot {
      animation: none;
    }
  }
  .matchup {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
  }
  .team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    min-width: 0;
  }
  .plate {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    width: 72px;
    height: 72px;
  }
  .plate.small {
    width: 22px;
    height: 22px;
  }
  .crest {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
  .crest-fallback {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    background: var(--elt-surface);
    color: var(--elt-fg);
  }
  .team-name {
    font-size: 15px;
    font-weight: 500;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .team-sub {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .score {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 40px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .score .sep {
    color: var(--elt-muted);
    font-weight: 400;
  }
  .score .trailing {
    color: var(--elt-fg2);
  }
  .when {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .when .day {
    font-size: 14px;
    color: var(--elt-fg2);
  }
  .when .time {
    font-size: 30px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .panel {
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .quarters {
    display: grid;
    gap: 4px 6px;
    font-size: 14px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .quarters .label {
    color: var(--elt-fg2);
    font-size: 12px;
  }
  .quarters .name {
    text-align: left;
  }
  .quarters .current {
    font-weight: 700;
  }
  .quarters .empty {
    color: var(--elt-muted);
  }
  .section-title {
    font-size: 12px;
    color: var(--elt-fg2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }
  .plays {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
  }
  .play {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: baseline;
  }
  .play .t {
    color: var(--elt-fg2);
    font-variant-numeric: tabular-nums;
  }
  .play.scoring .text {
    font-weight: 500;
  }
  .play .sc {
    color: var(--elt-fg2);
    font-variant-numeric: tabular-nums;
  }
  .compare {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px 12px;
    align-items: center;
    font-size: 14px;
  }
  .compare .mid {
    color: var(--elt-fg2);
    font-size: 12px;
    text-align: center;
  }
  .compare .r {
    text-align: right;
    justify-self: end;
  }
  .form {
    display: flex;
    gap: 3px;
  }
  .chip {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .chip.small {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  .chip.W {
    background: var(--elt-win-bg);
    color: var(--elt-win-fg);
  }
  .chip.L {
    background: var(--elt-loss-bg);
    color: var(--elt-loss-fg);
  }
  .players {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, auto);
    gap: 5px 12px;
    font-size: 14px;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
  }
  .players .h {
    color: var(--elt-fg2);
    font-size: 12px;
    text-align: right;
  }
  .players .h:first-child {
    text-align: left;
  }
  .players .n {
    text-align: right;
  }
  .players .pname {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .players .num {
    color: var(--elt-fg2);
  }
  .bars {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    gap: 6px 10px;
    font-size: 13px;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }
  .bars .l {
    text-align: right;
  }
  .bar-label {
    font-size: 11px;
    color: var(--elt-fg2);
    text-align: center;
    margin-bottom: 2px;
  }
  .bar {
    display: flex;
    height: 6px;
    gap: 2px;
    border-radius: 3px;
    overflow: hidden;
  }
  .bar .us {
    background: var(--elt-accent);
  }
  .bar .them {
    flex: 1;
    background: var(--elt-bar-other);
  }
  .foot {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .standings {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .srow {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 44px 48px 92px;
    gap: 0 8px;
    align-items: center;
    min-height: 28px;
    padding: 0 6px;
    border-radius: 6px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .srow.header {
    font-size: 12px;
    color: var(--elt-fg2);
    min-height: 20px;
  }
  .srow.me {
    background: var(--elt-surface);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--elt-accent);
  }
  .srow .tn {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .srow .tn span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .srow .tn img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex: none;
  }
  .srow .num {
    text-align: right;
  }
  .srow .form {
    justify-content: flex-end;
  }
  .pos {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }
  .pos.playoffs {
    background: var(--elt-zone-playoffs);
    color: var(--elt-zone-fg);
  }
  .pos.play_in {
    background: var(--elt-zone-playin);
    color: var(--elt-zone-fg);
  }
  .legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--elt-fg2);
    align-items: center;
    flex-wrap: wrap;
  }
  .legend i {
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 3px;
    margin-right: 5px;
    vertical-align: -1px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .tile {
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 8px 10px;
  }
  .tile .k {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .tile .v {
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .ranks {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 6px 12px;
    font-size: 14px;
    align-items: baseline;
  }
  .ranks .cat {
    color: var(--elt-fg2);
    font-size: 13px;
  }
  .ranks .rank {
    font-weight: 700;
  }
  .court {
    width: 100%;
    height: auto;
    display: block;
    background: var(--elt-surface);
    border-radius: 10px;
  }
  .court .lines {
    fill: none;
    stroke: var(--elt-fg2);
    stroke-opacity: 0.4;
    stroke-width: 8;
  }
  .court .made {
    fill: var(--elt-accent);
  }
  .court .miss {
    fill: none;
    stroke: var(--elt-muted);
    stroke-width: 7;
  }
  .shot-legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--elt-fg2);
    align-items: center;
    margin-top: 6px;
  }
  .shot-legend .m {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--elt-accent);
    display: inline-block;
    margin-right: 5px;
  }
  .shot-legend .x {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 2px solid var(--elt-muted);
    display: inline-block;
    margin-right: 5px;
  }
  .shot-legend .sum {
    margin-left: auto;
  }
  .subtabs {
    display: flex;
    gap: 20px;
    border-bottom: 1px solid var(--elt-divider);
  }
  .subtabs button {
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font: inherit;
    font-size: 14px;
    color: var(--elt-fg2);
    padding: 6px 2px;
    min-height: 36px;
    cursor: pointer;
  }
  .subtabs button[aria-selected="true"] {
    color: var(--elt-fg);
    font-weight: 700;
    border-bottom-color: var(--elt-accent);
  }
  .subtabs button:focus-visible,
  .nav:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .chart {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
    font-family: inherit;
  }
  .chart .grid {
    stroke: var(--elt-divider);
    stroke-dasharray: 3 4;
  }
  .chart .zero,
  .chart .track {
    stroke: var(--elt-muted);
    stroke-width: 1;
  }
  .chart .track {
    stroke: var(--elt-divider);
    stroke-width: 2;
  }
  .chart .area-up {
    fill: var(--elt-accent);
    fill-opacity: 0.35;
  }
  .chart .area-down {
    fill: var(--elt-other);
    fill-opacity: 0.35;
  }
  .chart .flow {
    fill: none;
    stroke: var(--elt-fg);
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .chart .axis {
    fill: var(--elt-fg2);
    font-size: 11px;
  }
  .chart .val,
  .chart .label {
    fill: var(--elt-fg);
    font-size: 11px;
  }
  .chart .label {
    font-size: 12px;
  }
  .chart .win {
    fill: var(--elt-accent);
  }
  .chart .loss {
    fill: var(--elt-other);
  }
  .chart .avg {
    stroke: var(--elt-muted);
    stroke-width: 2;
  }
  .chart .span {
    stroke: var(--elt-accent);
    stroke-width: 4;
  }
  .chart .dot {
    fill: var(--elt-accent);
  }
  .chart .ring {
    fill: var(--elt-bg);
    stroke: var(--elt-accent);
    stroke-width: 3;
  }
  .legend i.round {
    border-radius: 50%;
  }
  .legend i.tick {
    width: 2px;
    background: var(--elt-muted);
  }
  .head .legend {
    gap: 10px;
  }
  .facts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 8px;
  }
  .facts.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 0;
  }
  .tile.small .v {
    font-size: 15px;
  }
  .tile .unit {
    font-size: 13px;
    font-weight: 400;
    color: var(--elt-fg2);
  }
  .tile .note {
    font-size: 12px;
    font-weight: 500;
    color: var(--elt-fg);
  }
  .rankbars {
    display: grid;
    grid-template-columns: 74px 42px minmax(0, 1fr) 36px;
    gap: 8px 10px;
    align-items: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .rankbars .k {
    color: var(--elt-fg2);
  }
  .rankbars .v {
    font-weight: 700;
    text-align: right;
  }
  .rankbars .r {
    text-align: right;
    font-weight: 700;
  }
  .rankbars .r.top {
    color: var(--elt-accent);
  }
  .rankbars .r.low {
    color: var(--elt-fg2);
    font-weight: 500;
  }
  .rb {
    position: relative;
    height: 16px;
  }
  .rb .t {
    position: absolute;
    left: 0;
    right: 0;
    top: 7px;
    height: 2px;
    border-radius: 1px;
    background: var(--elt-divider);
  }
  .rb .a {
    position: absolute;
    top: 2px;
    width: 2px;
    height: 12px;
    margin-left: -1px;
    background: var(--elt-muted);
  }
  .rb .p {
    position: absolute;
    top: 2px;
    width: 12px;
    height: 12px;
    margin-left: -6px;
    border-radius: 50%;
    background: var(--elt-accent);
    box-shadow: 0 0 0 2px var(--elt-bg);
  }
  .leaders {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .leader {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 6px 12px;
  }
  .head-shot {
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    background: var(--elt-divider);
  }
  .head-shot.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--elt-fg2);
  }
  .leader .who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 14px;
  }
  .leader .who b {
    font-weight: 500;
  }
  .leader .who span,
  .leader .who b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .leader .who span {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .leader .num {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-variant-numeric: tabular-nums;
  }
  .leader .num b {
    font-size: 16px;
  }
  .leader .rank {
    font-size: 12px;
    font-weight: 700;
  }
  .leader .rank.top {
    color: var(--elt-accent);
  }
  .court.zones .z {
    fill: var(--elt-accent);
  }
  .court.zones .bg {
    fill: var(--elt-surface-solid);
  }
  .court .zone-lines {
    fill: none;
    stroke: var(--elt-bg);
    stroke-width: 8;
  }
  .court .tag {
    fill: var(--elt-bg);
    fill-opacity: 0.85;
  }
  .court .tag-v {
    fill: var(--elt-fg);
    font-size: 46px;
    font-weight: 700;
  }
  .court .tag-k {
    fill: var(--elt-fg2);
    font-size: 30px;
  }
  .zone-table {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto 52px 60px;
    gap: 6px 10px;
    align-items: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .zone-table .h {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .zone-table .r {
    text-align: right;
  }
  .zone-table .dim {
    color: var(--elt-fg2);
  }
  .zone-table .sw {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: var(--elt-accent);
  }
  .h2h-row {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    font-size: 14px;
    padding: 7px 0;
    border-top: 1px solid var(--elt-divider);
    font-variant-numeric: tabular-nums;
  }
  .h2h-row .d {
    font-size: 13px;
    color: var(--elt-fg2);
  }
  .h2h-row .w {
    font-weight: 700;
  }
  .h2h-row .dim {
    color: var(--elt-fg2);
  }
  .round-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .round-title {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
  }
  .nav {
    width: 36px;
    height: 36px;
    flex: none;
    border: 0;
    border-radius: 8px;
    background: var(--elt-surface);
    color: var(--elt-fg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .nav:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .nav svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
  }
  .bgame {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 7px 10px;
    border-radius: 8px;
  }
  .bgame.me {
    background: var(--elt-surface);
    box-shadow: inset 3px 0 0 var(--elt-accent);
  }
  .bgame .side {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .bgame .side .c {
    flex: 1;
  }
  .bgame .side.w {
    font-weight: 700;
  }
  .bgame .side.dim {
    color: var(--elt-fg2);
  }
  .mini-crest {
    width: 22px;
    height: 22px;
    object-fit: contain;
    flex: none;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    padding: 2px;
    box-sizing: border-box;
  }
  .mini-crest.fallback {
    background: var(--elt-divider);
  }
  .when-s {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .day {
    font-size: 12px;
    color: var(--elt-fg2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 4px 0 2px;
  }
  .bgame.timed {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 8px;
  }
  .bgame.timed .side {
    grid-column: 1;
  }
  .bgame .t {
    grid-column: 2;
    grid-row: 1 / span 2;
    font-size: 13px;
    color: var(--elt-fg2);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .bgame .t.live {
    color: var(--elt-accent);
    font-weight: 700;
  }
  @container (max-width: 340px) {
    .board {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .cutline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--elt-fg2);
    margin: 2px 0;
  }
  .cutline span {
    flex: 1;
    border-top: 1px dashed var(--elt-muted);
  }
  .tile.race.clinched .v {
    color: var(--elt-accent);
  }
  .tile.race.eliminated .v {
    color: var(--elt-fg2);
  }
  .tile .note:empty {
    display: none;
  }
  .series {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .series-status {
    font-size: 15px;
  }
  .series-games {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }
  .sg {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 0;
    border-radius: 6px;
    background: var(--elt-surface);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .series .sg {
    background: var(--elt-bg);
  }
  .sg.current {
    box-shadow: inset 0 0 0 2px var(--elt-accent);
  }
  .sg .n {
    color: var(--elt-fg2);
  }
  .sg .r {
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .sg.none {
    background: transparent !important;
    border: 1px dashed var(--elt-divider);
  }
  .sg.none .r {
    font-weight: 400;
    font-size: 11px;
    color: var(--elt-muted);
  }
  .bgrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }
  .bgrid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .bbox {
    background: var(--elt-surface);
    border-radius: 8px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .bbox.me {
    box-shadow: inset 3px 0 0 var(--elt-accent);
  }
  .bbox .bl {
    font-size: 11px;
    color: var(--elt-fg2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bside {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .bside.w {
    font-weight: 700;
  }
  .bside.dim {
    color: var(--elt-fg2);
  }
  .bside .seed {
    width: 14px;
    font-size: 11px;
    font-weight: 400;
    color: var(--elt-fg2);
    text-align: right;
  }
  .bside .c {
    flex: 1;
  }
  .bgrid.three .mini-crest {
    display: none;
  }
  ha-card.compact-card {
    padding: 10px 14px;
    cursor: pointer;
    justify-content: center;
    min-height: 56px;
    box-sizing: border-box;
  }
  ha-card.compact-card:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .compact {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .compact .crests {
    display: flex;
    gap: 4px;
    flex: none;
  }
  .c-crest {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    padding: 3px;
    box-sizing: border-box;
  }
  .c-crest.fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    background: var(--elt-surface);
  }
  .compact .cm {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .compact .cmain {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
  }
  .compact .score-line {
    font-size: 17px;
  }
  .compact .score-line b {
    font-weight: 700;
  }
  .compact .score-line b.trailing {
    color: var(--elt-fg2);
  }
  .compact .cs {
    font-size: 12px;
    color: var(--elt-fg2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-state {
    font-size: 14px;
    color: var(--elt-fg2);
    padding: 12px 0;
    text-align: center;
  }
  .warning {
    padding: 12px;
    font-size: 14px;
  }
`;
