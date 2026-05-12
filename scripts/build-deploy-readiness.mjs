#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.6.4-organization-settings-notifications-ui-system-final-alignment";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/verify-v58.25.6.4.mjs",
  "docs/release/V58_25_6_4_ORGANIZATION_SETTINGS_NOTIFICATIONS_UI_SYSTEM_FINAL_ALIGNMENT.md",
  "docs/qa/FLOWTASK_V58_25_6_4_ORGANIZATION_SETTINGS_NOTIFICATIONS_UI_SYSTEM_FINAL_ALIGNMENT_QA.md",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/(app)/app/settings/page.tsx",
  "src/app/(app)/app/notifications/page.tsx",
  "src/app/(app)/app/profile/page.tsx",
  "src/components/settings/settings-account-overview.tsx",
  "src/components/settings/account-danger-zone.tsx",
  "src/components/notifications/notifications-command-center.tsx",
  "src/components/notifications/notifications-live-panel.tsx",
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.6.4") failures.push("verify:current must target verify:v58.25.6.4");
if (scripts["verify:v58.25.6.4"] !== "node scripts/verify-v58.25.6.4.mjs") failures.push("verify:v58.25.6.4 must target scripts/verify-v58.25.6.4.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.25.6.4 — Organization + Settings + Notifications UI System Final Alignment");
requireIncludes("src/app/(app)/app/organization/page.tsx", "ft-org-screen");
requireIncludes("src/app/(app)/app/settings/page.tsx", "ft-settings-screen");
requireIncludes("src/app/(app)/app/notifications/page.tsx", "ft-notifications-ui-screen");
requireIncludes("src/app/(app)/app/profile/page.tsx", "ft-profile-hero");
requireNotIncludes("src/app/(app)/app/profile/page.tsx", "bg-[linear-gradient(135deg,#0f172a");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.25.6.4 Organization + Settings + Notifications readiness aligned.");
