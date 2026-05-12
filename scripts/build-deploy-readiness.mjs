#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.7-global-productivity-density-system-ui-scale-refactor";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

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
  "scripts/verify-v58.25.7.mjs",
  "docs/release/V58_25_7_GLOBAL_PRODUCTIVITY_DENSITY_SYSTEM_UI_SCALE_REFACTOR.md",
  "docs/qa/FLOWTASK_V58_25_7_GLOBAL_PRODUCTIVITY_DENSITY_SYSTEM_UI_SCALE_REFACTOR_QA.md",
  "src/app/globals.css",
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.7") failures.push("verify:current must target verify:v58.25.7");
if (scripts["density:guard"] !== "node scripts/density-guard.mjs") failures.push("density:guard must target scripts/density-guard.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", "v58.25.7 — Global Productivity Density System + UI Scale Refactor");
requireIncludes("src/app/globals.css", "--ft-density-control-height");
requireIncludes("src/app/globals.css", ".ft-kanban-card");
requireIncludes("scripts/density-guard.mjs", "density-guard");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.25.7 global productivity density readiness aligned.");
