#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.4-notifications-center-redesign";
const expectedRelease = "v58.25.4 Notifications Center Redesign";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.4");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.4") failures.push("verify:current must target verify:v58.25.4");
if ((pkg.scripts ?? {})["verify:v58.25.4"] !== "node scripts/verify-v58.25.4.mjs") failures.push("verify:v58.25.4 script must be available");

requireFile("scripts/verify-v58.25.4.mjs");
requireFile("docs/release/V58_25_4_NOTIFICATIONS_CENTER_REDESIGN.md");
requireFile("docs/qa/FLOWTASK_V58_25_4_NOTIFICATIONS_CENTER_REDESIGN_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.25.4");

requireIncludes("src/app/globals.css", "v58.25.4 — Notification Center Redesign");
requireIncludes("src/app/globals.css", ".ft-notifications-shell");
requireIncludes("src/app/globals.css", "max-width: none");
requireIncludes("src/app/globals.css", ".ft-notifications-hero");
requireIncludes("src/app/globals.css", ".ft-notification-chip-active");
requireIncludes("src/app/globals.css", ".ft-notification-row");

requireIncludes("src/app/(app)/app/notifications/page.tsx", "ft-notifications-shell");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-hero");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "Centro claro para revisar avisos");
requireNotIncludes("src/components/notifications/notifications-command-center.tsx", "bg-[linear-gradient(135deg,#062b2a");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "ft-notifications-panel");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "ft-notification-chip-active");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "displayFilterLabel");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "Asignadas a mí");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "Actualizaciones");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "ft-notification-row");
requireIncludes("src/components/notifications/notifications-live-panel.tsx", "No leída");

if (failures.length) {
  console.error("[verify:v58.25.4] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.4] OK — Notification Center redesign aligned.");
