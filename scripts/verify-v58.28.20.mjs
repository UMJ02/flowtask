import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const pageText = readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const cssText = readFileSync("src/app/globals.css", "utf8");
const failures = [];
const expectedVersion = "58.28.20-mobile-responsive-final-pass";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.20") failures.push("verify:current must target verify:v58.28.20");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:mobile-responsive:ready")) failures.push("build:preflight must include workspace:mobile-responsive:ready");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.20 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
if (!pageText.includes("ws-pro-sheet")) failures.push("Workspace Pro sheets must expose mobile responsive class");
if (!pageText.includes("ws-pro-inspector")) failures.push("Workspace Pro inspector must expose mobile responsive class");
if (!pageText.includes("ws-pro-mobile-sidebar-panel")) failures.push("Workspace Pro mobile sidebar must expose mobile responsive class");
if (!cssText.includes("v58.28.20 — Mobile / Responsive Final Pass")) failures.push("globals.css must include v58.28.20 responsive marker");
if (!cssText.includes("100dvh")) failures.push("Mobile responsive CSS must use dynamic viewport units");
if (!cssText.includes("grid-auto-columns: minmax(18rem, 82vw)")) failures.push("Board mobile columns must use controlled horizontal layout");
if (!cssText.includes("max-height: min(88dvh, 42rem)")) failures.push("Sheets must become mobile bottom sheets");

if (failures.length) {
  console.error("[verify:v58.28.20] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.20] OK — mobile and responsive final pass aligned.");
