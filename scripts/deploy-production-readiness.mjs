#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.0-create-flow-refresh-project-inline-activation";
const expectedVerifyCurrent = "npm run verify:v58.21.0";

function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }

const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.21.0");
scripts["verify:v58.21.0"] === "node scripts/verify-v58.21.0.mjs" ? pass("version verifier available") : fail("verify:v58.21.0 script missing or incorrect");
fileExists("scripts/verify-v58.21.0.mjs") ? pass("verify-v58.21.0 script exists") : fail("scripts/verify-v58.21.0.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.21.0");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_21_0_CREATE_FLOW_REFRESH_PROJECT_INLINE_ACTIVATION.md") ? pass("release notes available") : fail("v58.21.0 release notes missing");
fileIncludes("src/components/projects/project-hero-inline-editor.tsx", "ProjectHeroInlineEditor") ? pass("project inline editor available") : fail("project inline editor missing");
fileIncludes("src/app/(app)/app/projects/[id]/edit/page.tsx", "mode") ? pass("project edit redirect aligned") : fail("project edit route must redirect to inline mode");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");

if (fileExists("vercel.json")) {
  const vercel = readJson("vercel.json");
  vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
  vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
} else fail("vercel.json missing");

fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.21.0 package version");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.21.0 production readiness aligned.");
