#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.7.3.1-boards-readiness-alignment-fix";

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text) { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

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
  "scripts/density-guard.mjs",
  "scripts/verify-v58.25.7.3.1.mjs",
  "docs/release/V58_25_7_3_1_BOARDS_READINESS_ALIGNMENT_FIX.md",
  "docs/qa/FLOWTASK_V58_25_7_3_1_BOARDS_READINESS_ALIGNMENT_FIX_QA.md",
  "src/components/boards/boards-home.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/app/globals.css",
  "public/boards-home/nuevo_proyecto.png"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.7.3.1") failures.push("verify:current must target verify:v58.25.7.3.1");
if (scripts["verify:v58.25.7.3.1"] !== "node scripts/verify-v58.25.7.3.1.mjs") failures.push("verify:v58.25.7.3.1 must target scripts/verify-v58.25.7.3.1.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/pizarra_blanco.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_fujo.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/plan_proyecto.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/nuevo_proyecto.png");
requireNotIncludes("src/components/boards/boards-home.tsx", "<HeroIllustration />");
requireIncludes("src/app/globals.css", "v58.25.7.3 — Boards hero remove + template icons restore");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.25.7.3.1 boards readiness alignment fixed.");
