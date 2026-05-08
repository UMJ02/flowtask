#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const expectedVersion = "58.20.1-task-workspace-visual-polish-interaction-qa";
const expectedVerifyCurrent = "npm run verify:v58.20.1";

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function fileExists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function fileIncludes(rel, text) {
  if (!fileExists(rel)) return false;
  return fs.readFileSync(path.join(root, rel), "utf8").includes(text);
}

function pass(label) {
  console.log(`[deploy-production-readiness] OK - ${label}`);
}

function fail(label) {
  failures.push(label);
}

const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};

if (pkg.version === expectedVersion) {
  pass("package version aligned");
} else {
  fail(`package version must be ${expectedVersion}`);
}

if (scripts["verify:current"] === expectedVerifyCurrent) {
  pass("verify current aligned");
} else {
  fail("verify:current must target verify:v58.20.1");
}

if (scripts["verify:v58.20.1"] === "node scripts/verify-v58.20.1.mjs") {
  pass("version verifier available");
} else {
  fail("verify:v58.20.1 script missing or incorrect");
}

if (fileExists("scripts/verify-v58.20.1.mjs")) {
  pass("verify-v58.20.1 script exists");
} else {
  fail("scripts/verify-v58.20.1.mjs missing");
}

if (fileIncludes("src/lib/release/version.ts", expectedVersion)) {
  pass("runtime version export aligned");
} else {
  fail("src/lib/release/version.ts must export v58.20.1");
}

if (fileIncludes("src/lib/release/version.ts", "production-candidate")) {
  pass("release stage aligned");
} else {
  fail("src/lib/release/version.ts must include production-candidate");
}

if (fileExists("docs/release/V58_20_1_TASK_WORKSPACE_VISUAL_POLISH_INTERACTION_QA.md")) {
  pass("release notes available");
} else {
  fail("v58.20.1 release notes missing");
}

if (fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL")) {
  pass("Supabase URL env documented");
} else {
  fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
}

if (fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
  pass("Supabase anon env documented");
} else {
  fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

if (fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY")) {
  pass("Supabase service role env documented");
} else {
  fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
}

if (fileExists("vercel.json")) {
  const vercel = readJson("vercel.json");

  if (vercel.framework === "nextjs") {
    pass("Vercel framework aligned");
  } else {
    fail("vercel.json framework must be nextjs");
  }

  if (vercel.buildCommand === "npm run vercel:build") {
    pass("Vercel build command aligned");
  } else {
    fail("vercel.json buildCommand must be npm run vercel:build");
  }
} else {
  fail("vercel.json missing");
}

if (fileIncludes("package-lock.json", expectedVersion)) {
  pass("package-lock version aligned");
} else {
  fail("package-lock.json must include v58.20.1 package version");
}

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.20.1 production readiness aligned.");
