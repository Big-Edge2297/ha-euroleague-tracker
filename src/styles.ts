import { css } from "lit";

export const styles = css`
  :host {
    display: block;
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
  .pill.live {
    background: var(--elt-accent);
    color: var(--elt-accent-fg);
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
