import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];

if (pkg.version !== "58.28.9-workspace-pro-brand-pastel-loading-system") failures.push("package.json version must be v58.28.9 brand pastel loading slug");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.9") failures.push("verify:current must target verify:v58.28.9");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:brand-pastel:ready")) failures.push("build:preflight must include workspace:brand-pastel:ready");
if (!version.includes("58.28.9-workspace-pro-brand-pastel-loading-system")) failures.push("release version must be v58.28.9");
if (!css.includes("v58.28.9 — Workspace Pro Brand Pastel Loading System")) failures.push("globals.css must include v58.28.9 pastel loading marker");
if (!css.includes("ws-pro-view-switching::before")) failures.push("view switching must use full-width pastel ribbon animation");

if (failures.length) {
  console.error("[verify:v58.28.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.9] OK — Workspace Pro brand pastel loading system aligned.");
