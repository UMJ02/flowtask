#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireMissing = (rel) => { if (exists(rel)) failures.push(`File should have been removed: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.1-settings-footer-cleanup-alignment-polish";
const expectedRelease = "v58.25.1 Settings Footer Cleanup + Alignment Polish";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.1") failures.push("verify:current must target verify:v58.25.1");
if ((pkg.scripts ?? {})["verify:v58.25.1"] !== "node scripts/verify-v58.25.1.mjs") failures.push("verify:v58.25.1 script must be available");

requireFile("scripts/verify-v58.25.1.mjs");
requireFile("docs/release/V58_25_1_SETTINGS_FOOTER_CLEANUP_ALIGNMENT_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_1_SETTINGS_FOOTER_CLEANUP_ALIGNMENT_POLISH_QA.md");
requireMissing("src/components/settings/settings-footer.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.25.1");

requireIncludes("src/app/globals.css", "v58.25.1 — Settings footer cleanup");
requireIncludes("src/app/(app)/app/settings/page.tsx", "ft-settings-shell");
requireNotIncludes("src/app/(app)/app/settings/page.tsx", "SettingsFooter");
requireNotIncludes("src/app/(app)/app/settings/page.tsx", "settings-footer");
requireIncludes("src/components/settings/settings-account-overview.tsx", "min-h-[96px]");
requireIncludes("src/components/settings/access-control-settings-card.tsx", "className=\"ft-settings-card p-4 md:p-5\"");
requireIncludes("src/components/settings/account-danger-zone.tsx", "p-4 md:p-5");

if (failures.length) {
  console.error("[verify:v58.25.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.1] OK — Settings footer cleanup and alignment polish aligned.");
