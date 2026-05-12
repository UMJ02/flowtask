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
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.2-settings-colorful-redesign-alignment";
const expectedRelease = "v58.25.2 Settings Colorful Redesign Alignment";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.2");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.2") failures.push("verify:current must target verify:v58.25.2");
if ((pkg.scripts ?? {})["verify:v58.25.2"] !== "node scripts/verify-v58.25.2.mjs") failures.push("verify:v58.25.2 script must be available");

requireFile("scripts/verify-v58.25.2.mjs");
requireFile("docs/release/V58_25_2_SETTINGS_COLORFUL_REDESIGN_ALIGNMENT.md");
requireFile("docs/qa/FLOWTASK_V58_25_2_SETTINGS_COLORFUL_REDESIGN_ALIGNMENT_QA.md");
requireFile("public/settings/herosettings.png");
requireMissing("src/components/settings/settings-footer.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.25.2");

requireIncludes("src/app/globals.css", "v58.25.2 — Settings Colorful Redesign Alignment");
requireIncludes("src/app/globals.css", "width: min(100%, 1440px)");
requireIncludes("src/app/globals.css", ".ft-settings-hero");
requireIncludes("src/app/globals.css", ".ft-settings-assistant-card");
requireIncludes("src/components/settings/settings-account-overview.tsx", "/settings/herosettings.png");
requireIncludes("src/components/settings/settings-account-overview.tsx", "ft-settings-hero");
requireIncludes("src/components/settings/settings-account-overview.tsx", "Cuenta, notificaciones y contexto de trabajo");
requireIncludes("src/components/settings/access-control-settings-card.tsx", "ft-settings-soft-gradient");
requireIncludes("src/components/settings/intelligent-attention-settings-card.tsx", "ft-settings-assistant-card");
requireIncludes("src/components/settings/account-danger-zone.tsx", "bg-white");
requireNotIncludes("src/app/(app)/app/settings/page.tsx", "SettingsFooter");

if (failures.length) {
  console.error("[verify:v58.25.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.2] OK — Settings colorful redesign aligned with guide.");
