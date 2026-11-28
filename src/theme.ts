// Card themes: auto (follows the HA theme), dark, light and team colours.

export type ThemeName = "auto" | "dark" | "light" | "team";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance, 0 (black) .. 1 (white). */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.2;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Text colour with the best contrast on the given background. */
export function readableOn(hex: string): string {
  const l = luminance(hex);
  const whiteContrast = 1.05 / (l + 0.05);
  const blackContrast = (l + 0.05) / 0.0625; // #111111
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#111111";
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex) ?? [128, 128, 128];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Solid blend of two colours (amount of b, 0..1). */
function mix(a: string, b: string, amount: number): string {
  const x = hexToRgb(a) ?? [128, 128, 128];
  const y = hexToRgb(b) ?? [128, 128, 128];
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * amount));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** An accent that stays visible on the card background. */
function visibleAccent(accent: string, bgLuminance: number): string {
  const l = luminance(accent);
  if (bgLuminance < 0.1 && l < 0.03) return "#8C8C8C"; // near-black team on dark card
  if (bgLuminance > 0.8 && l > 0.85) return "#5C5C5C"; // near-white team on light card
  return accent;
}

export function themeVars(theme: ThemeName, teamColor: string): Record<string, string> {
  const base = {
    // Behind crests: many are dark grey or black and vanish on dark backgrounds.
    "--elt-crest-plate": "rgba(255, 255, 255, 0.92)",
    "--elt-win-bg": "#2E7D32",
    "--elt-win-fg": "#FFFFFF",
    // A step softer than the team accent; both keep white numbers readable (4.5:1+).
    "--elt-zone-playoffs": "#3F63A8",
    "--elt-zone-playin": "#93681C",
    "--elt-zone-fg": "#FFFFFF",
  };
  switch (theme) {
    case "dark": {
      const accent = visibleAccent(teamColor, 0.012);
      return {
        ...base,
        "--elt-bg": "#1C1C1C",
        "--elt-fg": "#E8E8E8",
        "--elt-fg2": "#A8A8A8",
        "--elt-muted": "#6E6E6E",
        "--elt-surface": "#262626",
        "--elt-divider": "#333333",
        "--elt-loss-bg": "#424242",
        "--elt-loss-fg": "#E0E0E0",
        "--elt-bar-other": "#5A5A5A",
        "--elt-other": "#5B8DEF",
        "--elt-surface-solid": "#262626",
        "--elt-accent": accent,
        "--elt-accent-fg": readableOn(accent),
      };
    }
    case "light": {
      const accent = visibleAccent(teamColor, 1);
      return {
        ...base,
        "--elt-crest-plate": "transparent",
        "--elt-bg": "#FFFFFF",
        "--elt-fg": "#1F1F1F",
        "--elt-fg2": "#5C5C5C",
        "--elt-muted": "#8A8A8A",
        "--elt-surface": "#F2F2F2",
        "--elt-divider": "#E3E3E3",
        "--elt-loss-bg": "#DDDDDD",
        "--elt-loss-fg": "#333333",
        "--elt-bar-other": "#C7C7C7",
        "--elt-other": "#2F6BD9",
        "--elt-surface-solid": "#F2F2F2",
        "--elt-accent": accent,
        "--elt-accent-fg": readableOn(accent),
      };
    }
    case "team": {
      const fg = readableOn(teamColor);
      return {
        ...base,
        "--elt-bg": teamColor,
        "--elt-fg": fg,
        "--elt-fg2": rgba(fg, 0.8),
        "--elt-muted": rgba(fg, 0.55),
        "--elt-surface": rgba(fg, 0.12),
        "--elt-divider": rgba(fg, 0.22),
        "--elt-loss-bg": rgba(fg, 0.22),
        "--elt-loss-fg": fg,
        "--elt-win-bg": fg,
        "--elt-win-fg": teamColor,
        "--elt-bar-other": rgba(fg, 0.3),
        // The other side: a shade darker (or lighter) than the card, not the text colour.
        "--elt-other": fg === "#FFFFFF" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.55)",
        "--elt-surface-solid": mix(teamColor, fg, 0.12),
        "--elt-accent": fg,
        "--elt-accent-fg": teamColor,
      };
    }
    default: {
      // auto: inherit from the active Home Assistant theme.
      return {
        ...base,
        "--elt-bg": "var(--ha-card-background, var(--card-background-color, #fff))",
        "--elt-fg": "var(--primary-text-color, #212121)",
        "--elt-fg2": "var(--secondary-text-color, #727272)",
        "--elt-muted": "var(--disabled-text-color, #9e9e9e)",
        "--elt-surface": "color-mix(in srgb, var(--primary-text-color, #212121) 7%, transparent)",
        "--elt-divider": "var(--divider-color, rgba(0,0,0,.12))",
        "--elt-loss-bg": "color-mix(in srgb, var(--primary-text-color, #212121) 20%, transparent)",
        "--elt-loss-fg": "var(--primary-text-color, #212121)",
        "--elt-bar-other": "color-mix(in srgb, var(--primary-text-color, #212121) 30%, transparent)",
        "--elt-other": "var(--info-color, #2F6BD9)",
        "--elt-surface-solid":
          "color-mix(in srgb, var(--primary-text-color, #212121) 7%, var(--ha-card-background, var(--card-background-color, #fff)))",
        "--elt-accent": teamColor,
        "--elt-accent-fg": readableOn(teamColor),
      };
    }
  }
}
