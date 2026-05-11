#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.24.9.10-session-security-interaction-performance-account-danger-zone-auth-asset-fix";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

for (const rel of [
  "package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example",
  "scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.24.9.10.mjs",
  "docs/release/V58_24_9_10_SESSION_SECURITY_INTERACTION_PERFORMANCE_ACCOUNT_DANGER_ZONE_AUTH_ASSET_FIX.md",
  "docs/qa/FLOWTASK_V58_24_9_10_SESSION_SECURITY_INTERACTION_PERFORMANCE_ACCOUNT_DANGER_ZONE_AUTH_ASSET_FIX_QA.md",
  "src/components/auth/idle-session-guard.tsx",
  "src/components/settings/account-danger-zone.tsx",
  "src/app/api/account/delete/route.ts",
  "public/check/confirmacion.png",
  "src/app/(public)/confirmed/page.tsx"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.24.9.10") failures.push("verify:current must target verify:v58.24.9.10");
if (scripts["verify:v58.24.9.10"] !== "node scripts/verify-v58.24.9.10.mjs") failures.push("verify:v58.24.9.10 must target scripts/verify-v58.24.9.10.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/layout/app-shell.tsx", "IdleSessionGuard");
requireIncludes("src/components/settings/account-danger-zone.tsx", "ELIMINAR");
requireIncludes("src/app/api/account/delete/route.ts", "createAdminClient");
requireIncludes("src/app/(public)/confirmed/page.tsx", "/check/confirmacion.png");
requireIncludes("src/app/globals.css", "ft-skeleton-card");
requireIncludes("src/app/globals.css", "ft-scroll-stable");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.24.9.10 readiness aligned.");
