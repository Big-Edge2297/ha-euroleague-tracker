// Runs the card tests: bundles each test/*.test.ts with esbuild, then runs them
// with Node's built-in test runner. jsdom provides the browser DOM.
import { build } from "esbuild";
import { readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const OUT = ".test-build";
rmSync(OUT, { recursive: true, force: true });
const entries = readdirSync("test")
  .filter((f) => f.endsWith(".test.ts"))
  .map((f) => `test/${f}`);

await build({
  entryPoints: entries,
  outdir: OUT,
  bundle: true,
  format: "esm",
  platform: "browser", // lit's browser build; jsdom supplies the DOM
  target: "es2022",
  external: ["jsdom", "node:*"],
  outExtension: { ".js": ".mjs" },
  logLevel: "warning",
});

const built = readdirSync(OUT)
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => `${OUT}/${f}`);
const run = spawnSync(process.execPath, ["--test", ...built], { stdio: "inherit" });
process.exit(run.status ?? 1);
