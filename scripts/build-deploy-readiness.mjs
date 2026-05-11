#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.9.1-visual-style-deduplication-motion-cleanup-pass";
const expectedReleaseLabel = "v58.24.9.9.1 Visual Style Deduplication + Motion Cleanup Pass";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.9.1.mjs",
  "docs/release/V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS.md",
  "docs/qa/FLOWTASK_V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS_QA.md",
  "src/app/globals.css"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.9.1"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.9.1") failures.push("verify:current must target verify:v58.24.9.9.1");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", ".ft-border");
requireIncludes("src/app/globals.css", ".ft-text-main");
requireIncludes("src/app/globals.css", ".ft-text-muted");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "rounded-[");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "rounded-[");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "animate-pulse");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "animate-pulse");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.9.1 visual deduplication readiness aligned.");
