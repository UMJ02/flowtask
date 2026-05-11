#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.9.1-visual-style-deduplication-motion-cleanup-pass";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.9.1" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.9.1");
scripts["verify:v58.24.9.9.1"] === "node scripts/verify-v58.24.9.9.1.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.9.1 script missing or incorrect");

for (const [label, rel] of [
  ["verify script exists", "scripts/verify-v58.24.9.9.1.mjs"],
  ["release notes available", "docs/release/V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS_QA.md"],
  ["global styles available", "src/app/globals.css"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.9.1");
read("src/app/globals.css").includes(".ft-border") ? pass("border alias available") : fail("ft-border missing");
read("src/app/globals.css").includes(".ft-text-main") ? pass("main text alias available") : fail("ft-text-main missing");
!read("src/components/tasks/task-action-list.tsx").includes("rounded-[") ? pass("task action arbitrary radii reduced") : fail("task action list still has arbitrary radii");
!read("src/components/tasks/task-kanban-board.tsx").includes("rounded-[") ? pass("kanban arbitrary radii reduced") : fail("kanban still has arbitrary radii");
!read("src/components/tasks/task-action-list.tsx").includes("animate-pulse") ? pass("task action direct pulse removed") : fail("task action list still has animate-pulse");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.9.1 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.9.1 production readiness aligned.");
