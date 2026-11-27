// Builds the card into the integration folder, which is what the release zip ships.
import { build, context } from "esbuild";

const options = {
  entryPoints: ["src/euroleague-tracker-card.ts"],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2021",
  legalComments: "none",
  outfile: "custom_components/euroleague_tracker/frontend/euroleague-tracker-card.js",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching src/ for changes…");
} else {
  await build(options);
}
