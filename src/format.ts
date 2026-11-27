// Small formatting helpers shared by the card (and tested on their own).

export function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
}

/** "E2026" -> "2026-27" */
export function seasonLabel(code?: string | null): string {
  const m = /^[A-Z](\d{4})$/.exec(code ?? "");
  if (!m) return code ?? "";
  const y = Number(m[1]);
  return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
}

/** "SUNEL ARENA" -> "Sunel Arena"; mixed-case text is left alone. */
export function titleCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  // Capitalise the first letter of each word; \b isn't Unicode-aware (Ž, Ö…).
  return s.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase());
}

/** 116 -> "+116", -20 -> "−20" (true minus sign), 0 -> "0". */
export function signed(d: unknown): string {
  if (typeof d !== "number") return "–";
  return d > 0 ? `+${d}` : `${d}`.replace("-", "−");
}
