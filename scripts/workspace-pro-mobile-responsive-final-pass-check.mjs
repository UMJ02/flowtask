import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const versionText = fs.readFileSync("src/lib/release/version.ts", "utf8");
const pageText = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const cssText = fs.readFileSync("src/app/globals.css", "utf8");
const allowedVersions = ["58.28.20-mobile-responsive-final-pass", "58.28.21-supabase-rls-client-readiness-final"];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.28.20", "npm run verify:v58.28.21"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.20 or verify:v58.28.21");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:mobile-responsive:ready")) failures.push("build:preflight must include workspace:mobile-responsive:ready");
if (!allowedVersions.some((version) => versionText.includes(version))) failures.push("version.ts must contain v58.28.20 or v58.28.21 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");

const requiredCss = [
  "v58.28.20 — Mobile / Responsive Final Pass",
  "100dvh",
  "grid-auto-flow: column",
  "grid-auto-columns: minmax(18rem, 82vw)",
  "scroll-snap-type: x proximity",
  "max-height: min(88dvh, 42rem)",
  "max-height: min(86dvh, 40rem)",
  "font-size: 16px",
  "env(safe-area-inset-bottom, 0px)",
];
for (const marker of requiredCss) {
  if (!cssText.includes(marker)) failures.push(`Missing responsive CSS marker: ${marker}`);
}

const requiredClasses = [
  "ws-pro-sheet",
  "ws-pro-inspector",
  "ws-pro-mobile-sidebar-panel",
  "ws-pro-mobile-sidebar-backdrop",
];
for (const marker of requiredClasses) {
  if (!pageText.includes(marker)) failures.push(`Missing responsive component class: ${marker}`);
}

if (cssText.includes("Actualizando vista")) failures.push("Loading ribbon copy must not return in mobile pass");
if (cssText.includes("animation: ws-pro-brand-ribbon") && !cssText.includes(".ws-pro-view-switching {\n  display: none !important;")) failures.push("Loading ribbon animations must remain disabled");

if (failures.length) {
  console.error("[workspace:mobile-responsive:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:mobile-responsive:ready] OK — mobile, tablet and responsive Workspace Pro surfaces aligned.");
