#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [
  ".nvmrc",
  "vercel.json",
  ".env.example",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "scripts/smoke-health.mjs",
  "scripts/postdeploy-smoke.mjs",
  "docs/release/DEPLOY_PRODUCTION_RUNBOOK.md",
  "docs/release/V58_10_5_MASTER_ALIGNMENT_CONTINUITY_FIX.md",
  "src/lib/release/version.ts",
];

const missing = checks.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[deploy-production-readiness] FAILED");
  for (const file of missing) console.error(` - Missing ${file}`);
  process.exit(1);
}

const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const versionTs = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

const expectations = [
  ["vercel build command", vercel.includes("npm run vercel:build")],
  ["vercel security headers", vercel.includes("X-Content-Type-Options") && vercel.includes("X-Frame-Options")],
  ["env has NEXT_PUBLIC_APP_URL", envExample.includes("NEXT_PUBLIC_APP_URL")],
  ["env has FLOWTASK_BASE_URL helper", envExample.includes("FLOWTASK_BASE_URL")],
  ["readme mentions V58.11", readme.includes("V58.11")],
  ["release exports include APP_RELEASE_STAGE", versionTs.includes("APP_RELEASE_STAGE")],
];

const failedExpectations = expectations.filter(([, ok]) => !ok);
if (failedExpectations.length) {
  console.error("[deploy-production-readiness] FAILED");
  for (const [label] of failedExpectations) console.error(` - ${label}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK");
for (const [label] of expectations) console.log(` - ${label}`);
