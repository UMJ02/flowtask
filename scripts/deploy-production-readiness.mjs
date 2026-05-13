#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.7.6-report-metrics-buckets-priority-star-export-alignment";

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
  "scripts/verify-v58.25.7.6.mjs",
  "docs/release/V58_25_7_6_REPORT_METRICS_BUCKETS_PRIORITY_STAR_EXPORT_ALIGNMENT.md",
  "docs/qa/FLOWTASK_V58_25_7_6_REPORT_METRICS_BUCKETS_PRIORITY_STAR_EXPORT_ALIGNMENT_QA.md",
  "src/lib/queries/analytics.ts",
  "src/lib/share/analytics-share.ts",
  "src/components/shared/shared-analytics-landing.tsx",
  "src/components/analytics/analytics-overview.tsx"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.7.6") failures.push("verify:current must target verify:v58.25.7.6");
if (scripts["verify:v58.25.7.6"] !== "node scripts/verify-v58.25.7.6.mjs") failures.push("verify:v58.25.7.6 must target scripts/verify-v58.25.7.6.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/queries/analytics.ts", "importantItems");
requireIncludes("src/lib/share/analytics-share.ts", "Mes actual");
requireIncludes("src/components/shared/shared-analytics-landing.tsx", "payload.shareDigest.weekCount");
requireNotIncludes("src/lib/share/analytics-share.ts", "Tareas del día");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.25.7.6 report metrics buckets readiness aligned.");
