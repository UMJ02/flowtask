#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.9-visual-system-cleanup-apple-workspace-ui-polish";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function pass(label){ console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label){ failures.push(label); }

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === "npm run verify:v58.24.9.9" ? pass("verify current aligned") : fail("verify:current must target verify:v58.24.9.9");
scripts["verify:v58.24.9.9"] === "node scripts/verify-v58.24.9.9.mjs" ? pass("version verifier available") : fail("verify:v58.24.9.9 script missing or incorrect");

for (const [label, rel] of [
  ["verify script exists", "scripts/verify-v58.24.9.9.mjs"],
  ["release notes available", "docs/release/V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH.md"],
  ["QA document available", "docs/qa/FLOWTASK_V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH_QA.md"],
  ["design guide available", "docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md"],
  ["global styles available", "src/app/globals.css"]
]) exists(rel) ? pass(label) : fail(`${label}: missing ${rel}`);

read("src/lib/release/version.ts").includes(expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.24.9.9");
read("src/app/globals.css").includes(".ft-apple-card") ? pass("Apple card primitive available") : fail("ft-apple-card missing");
read("src/app/globals.css").includes(".ft-apple-panel") ? pass("Apple panel primitive available") : fail("ft-apple-panel missing");
read("src/app/globals.css").includes(".ft-apple-button") ? pass("Apple button primitive available") : fail("ft-apple-button missing");
read("src/app/globals.css").includes("prefers-reduced-motion") ? pass("Reduced motion policy available") : fail("reduced motion policy missing");
read("docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md").includes("FlowTask OS") ? pass("visual system guide aligned") : fail("visual system guide missing FlowTask OS");
read("package-lock.json").includes(expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.24.9.9 package version");

const vercel = JSON.parse(read("vercel.json"));
vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.24.9.9 production readiness aligned.");
