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

const expectedVersion = "58.25.7.7-boards-hero-template-icons-notifications-metric-polish";
const expectedRelease = "v58.25.7.7 Boards Hero + Template Icons + Notifications Metric Polish";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.7");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.7") failures.push("verify:current must target verify:v58.25.7.7");
if ((pkg.scripts ?? {})["verify:v58.25.7.7"] !== "node scripts/verify-v58.25.7.7.mjs") failures.push("verify:v58.25.7.7 script missing");

requireFile("docs/release/V58_25_7_7_BOARDS_HERO_TEMPLATE_ICONS_NOTIFICATIONS_METRIC_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_7_BOARDS_HERO_TEMPLATE_ICONS_NOTIFICATIONS_METRIC_POLISH_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-compact-actions");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/pizarra_blanco.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_flujo.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/plan_proyecto.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/mapa_ideas.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/wireframe.png");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-preview-red");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-color-cover");

requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-hero-balanced");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-metric-wide");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-metric-icon");

requireIncludes("src/app/globals.css", "v58.25.7.7 — Boards hero layout + template icons + notification metrics polish");
requireIncludes("src/app/globals.css", ".board-home-hero-compact-actions");
requireIncludes("src/app/globals.css", ".ft-notifications-hero-balanced");
requireIncludes("src/app/globals.css", ".ft-notifications-metric-wide");

requireNotIncludes("src/components/boards/boards-home.tsx", "<HeroIllustration />");

if (failures.length) {
  console.error("[verify:v58.25.7.7] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.7] OK — boards hero, template icons and notification metrics aligned.");
