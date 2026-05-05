#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const releaseVersion = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql"), "utf8");
const smokeDoc = fs.readFileSync(path.join(root, "docs/qa/FLOWTASK_V58.19.9_SUPABASE_LIVE_QA_SMOKE.md"), "utf8");

const expectedVersion = "58.19.9-supabase-live-qa-vercel-verify-fix";
const checks = [
  ["vercel build command", vercel.buildCommand === "npm run vercel:build"],
  ["vercel security headers", Array.isArray(vercel.headers) && vercel.headers.length > 0],
  ["env has NEXT_PUBLIC_APP_URL", envExample.includes("NEXT_PUBLIC_APP_URL=")],
  ["env has FLOWTASK_BASE_URL helper", envExample.includes("FLOWTASK_BASE_URL=")],
  ["readme mentions v58.19.9", readme.includes("v58.19.9 Supabase Live QA + Vercel Verify Fix")],
  ["release exports include APP_RELEASE_STAGE", releaseVersion.includes("APP_RELEASE_STAGE")],
  ["release exports production-candidate", releaseVersion.includes("production-candidate")],
  ["package version aligned", pkg.version === expectedVersion],
  ["verify current aligned", pkg.scripts?.["verify:current"] === "npm run verify:v58.19.9"],
  ["migration includes client delete RPC", migration.includes("delete_workspace_client")],
  ["migration includes scoped catalog indexes", migration.includes("countries_scope_name_unique") && migration.includes("departments_scope_name_unique")],
  ["final smoke covers Supabase", smokeDoc.includes("doctor:supabase")],
  ["final smoke covers personal/org isolation", smokeDoc.includes("Aislamiento personal ↔ organización")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK");
for (const [label] of checks) console.log(` - ${label}`);
