#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== "58.24.8.1-boards-hero-asset-integration-template-preview-cleanup") failures.push("package version must be v58.24.8.1 hero asset integration");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.8.1") failures.push("verify:current must target verify:v58.24.8.1");
if ((pkg.scripts ?? {})["verify:v58.24.8.1"] !== "node scripts/verify-v58.24.8.1.mjs") failures.push("verify:v58.24.8.1 script must be available");
if (!exists("scripts/verify-v58.24.8.1.mjs")) failures.push("missing verify-v58.24.8.1 script");

requireIncludes("src/lib/release/version.ts", "58.24.8.1-boards-hero-asset-integration-template-preview-cleanup");
requireIncludes("src/lib/release/version.ts", "v58.24.8.1 Boards Hero Asset Integration + Template Preview Cleanup");
requireIncludes("package-lock.json", "58.24.8.1-boards-hero-asset-integration-template-preview-cleanup");
requireIncludes("src/components/boards/boards-home.tsx", 'src="/boards-home/hero.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'previewSrc: "/boards-home/diagrama_fujo.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'previewSrc: "/boards-home/plan_proyecto.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'previewSrc: "/boards-home/mapa_ideas.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'previewSrc: "/boards-home/pizarra_blanco.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'previewSrc: "/boards-home/wireframe.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'src: "/boards-home/icon-flecha.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'src: "/boards-home/icon-frame.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'src: "/boards-home/icon-text.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'src: "/boards-home/icon-puntos.png"');
requireIncludes("src/components/boards/boards-home.tsx", 'board-home-template-preview-asset');
requireIncludes("src/app/globals.css", "v58.24.8.1 — Boards Hero Asset Integration + Template Preview Cleanup");
requireIncludes("src/app/globals.css", ".board-home-hero-stage-frame");
requireIncludes("src/app/globals.css", ".board-home-template-preview-asset");
requireIncludes("docs/release/V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP.md", "v58.24.8.1");
requireIncludes("docs/qa/FLOWTASK_V58_24_8_1_BOARDS_HERO_ASSET_INTEGRATION_TEMPLATE_PREVIEW_CLEANUP_QA.md", "QA");
requireIncludes("README.md", "v58.24.8.1");
for (const rel of [
  "public/boards-home/hero.png",
  "public/boards-home/diagrama_fujo.png",
  "public/boards-home/plan_proyecto.png",
  "public/boards-home/mapa_ideas.png",
  "public/boards-home/pizarra_blanco.png",
  "public/boards-home/wireframe.png",
  "public/boards-home/icon-flecha.png",
  "public/boards-home/icon-frame.png",
  "public/boards-home/icon-text.png",
  "public/boards-home/icon-puntos.png",
]) requireFile(rel);

if (failures.length) {
  console.error("[verify:v58.24.8.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.24.8.1] OK — Boards hero asset integration and template preview cleanup aligned.");
