#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireMissing = (rel) => { if (exists(rel)) failures.push(`File should not exist: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.25.3-settings-width-compact-hero-metrics";
const expectedRelease = "v58.25.3 Settings Width + Compact Hero/Metrics";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.3");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.3") failures.push("verify:current must target verify:v58.25.3");
if ((pkg.scripts ?? {})["verify:v58.25.3"] !== "node scripts/verify-v58.25.3.mjs") failures.push("verify:v58.25.3 script must be available");

requireFile("scripts/verify-v58.25.3.mjs");
requireFile("docs/release/V58_25_3_SETTINGS_WIDTH_COMPACT_HERO_METRICS.md");
requireFile("docs/qa/FLOWTASK_V58_25_3_SETTINGS_WIDTH_COMPACT_HERO_METRICS_QA.md");
requireFile("public/settings/herosettings.png");
requireMissing("src/components/settings/settings-footer.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.25.3");

requireIncludes("src/app/globals.css", "v58.25.3 — Settings width + compact hero/metrics adjustment");
requireIncludes("src/app/globals.css", "max-width: none");
requireIncludes("src/app/globals.css", "width: 100%");
requireIncludes("src/components/settings/settings-account-overview.tsx", "min-h-[168px]");
requireIncludes("src/components/settings/settings-account-overview.tsx", "lg:grid-cols-[minmax(0,1fr)_360px]");
requireIncludes("src/components/settings/settings-account-overview.tsx", "h-[170px]");
requireIncludes("src/components/settings/settings-account-overview.tsx", "p-4 md:grid-cols-2 xl:grid-cols-4");
requireIncludes("src/components/settings/settings-account-overview.tsx", "/settings/herosettings.png");

if (failures.length) {
  console.error("[verify:v58.25.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.3] OK — Settings width and compact hero/metrics aligned.");
