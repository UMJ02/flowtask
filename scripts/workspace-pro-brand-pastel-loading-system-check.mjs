import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];

if (pkg.version !== "58.28.9-workspace-pro-brand-pastel-loading-system") failures.push(`Unexpected package version: ${pkg.version}`);
if (!css.includes("--ws-pro-mint-pastel")) failures.push("Missing Workspace Pro pastel token set");
if (!css.includes("ws-pro-view-switching::before")) failures.push("Missing full-width loading ribbon pseudo element");
if (!css.includes("ws-pro-home-summary")) failures.push("Missing home pastel refinements");

if (failures.length) {
  console.error("[workspace:brand-pastel:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:brand-pastel:ready] OK — Workspace Pro pastel brand colors and full-width loading ribbon aligned.");
