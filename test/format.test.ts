import assert from "node:assert/strict";
import { test } from "node:test";

import { ordinalSuffix, seasonLabel, signed, titleCase } from "../src/format";
import { luminance, readableOn, themeVars } from "../src/theme";

test("ordinal suffixes, including the teens", () => {
  const got = [1, 2, 3, 4, 11, 12, 13, 19, 21, 22, 23, 101, 111].map((n) => `${n}${ordinalSuffix(n)}`);
  assert.deepEqual(got, ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "19th", "21st", "22nd", "23rd", "101st", "111th"]);
});

test("season codes become readable seasons", () => {
  assert.equal(seasonLabel("E2026"), "2026-27");
  assert.equal(seasonLabel("U2099"), "2099-00");
  assert.equal(seasonLabel("something"), "something");
  assert.equal(seasonLabel(undefined), "");
});

test("all-caps venue names are title-cased, mixed case is kept", () => {
  assert.equal(titleCase("SUNEL ARENA"), "Sunel Arena");
  assert.equal(titleCase("ŽALGIRIO ARENA"), "Žalgirio Arena");
  assert.equal(titleCase("Palau Blaugrana"), "Palau Blaugrana");
});

test("point differences carry a sign and a real minus", () => {
  assert.equal(signed(116), "+116");
  assert.equal(signed(-20), "−20");
  assert.equal(signed(0), "0");
  assert.equal(signed(null), "–");
});

test("luminance and readable text colour", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#FFFFFF"), 1);
  assert.equal(readableOn("#C62828"), "#FFFFFF", "white on Olympiacos red");
  assert.equal(readableOn("#F2C200"), "#111111", "dark text on Maccabi yellow");
  assert.equal(readableOn("#007A33"), "#FFFFFF", "white on Panathinaikos green");
});

test("team theme: club colour background with readable text and inverted win chips", () => {
  const red = themeVars("team", "#C62828");
  assert.equal(red["--elt-bg"], "#C62828");
  assert.equal(red["--elt-fg"], "#FFFFFF");
  assert.equal(red["--elt-win-bg"], "#FFFFFF");
  assert.equal(red["--elt-win-fg"], "#C62828");
  const yellow = themeVars("team", "#F2C200");
  assert.equal(yellow["--elt-fg"], "#111111");
});

test("accents stay visible: a near-black club on the dark theme, a near-white club on the light theme", () => {
  assert.equal(themeVars("dark", "#1C1C1C")["--elt-accent"], "#8C8C8C");
  assert.equal(themeVars("dark", "#C62828")["--elt-accent"], "#C62828");
  assert.equal(themeVars("light", "#FAFAFA")["--elt-accent"], "#5C5C5C");
  assert.equal(themeVars("light", "#C62828")["--elt-accent"], "#C62828");
});

test("auto theme follows Home Assistant's theme variables", () => {
  const auto = themeVars("auto", "#C62828");
  assert.match(auto["--elt-bg"], /var\(--ha-card-background/);
  assert.match(auto["--elt-fg"], /var\(--primary-text-color/);
  assert.equal(auto["--elt-accent"], "#C62828");
});

test("crests get a light backing disc on dark backgrounds, none on the light theme", () => {
  for (const theme of ["dark", "team", "auto"] as const) {
    assert.equal(themeVars(theme, "#C62828")["--elt-crest-plate"], "rgba(255, 255, 255, 0.92)", theme);
  }
  assert.equal(themeVars("light", "#C62828")["--elt-crest-plate"], "transparent");
});
