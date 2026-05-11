#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.9-visual-system-cleanup-apple-workspace-ui-polish";
const expectedReleaseLabel = "v58.24.9.9 Visual System Cleanup + Apple Workspace UI Polish";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.9.mjs",
  "docs/release/V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH.md",
  "docs/qa/FLOWTASK_V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH_QA.md",
  "docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md",
  "src/app/globals.css"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build","vercel:build","deploy:readiness","build:preflight","verify:current","deploy:production:ready","verify:v58.24.9.9"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.9") failures.push("verify:current must target verify:v58.24.9.9");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/app/globals.css", ".ft-apple-card");
requireIncludes("src/app/globals.css", ".ft-apple-panel");
requireIncludes("src/app/globals.css", ".ft-apple-button");
requireIncludes("src/app/globals.css", "prefers-reduced-motion");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "ft-apple-panel");
requireIncludes("src/components/tasks/task-action-list.tsx", "ft-apple-panel");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "ft-apple-panel");
requireIncludes("docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md", "Motion policy");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.9 visual system readiness aligned.");
