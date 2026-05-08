#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.1-user-language-interaction-cleanup";
const expectedVerifyCurrent = "npm run verify:v58.21.1";

function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function fileNotIncludes(rel, text) { return fileExists(rel) && !fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }

const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};

pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.21.1");
scripts["verify:v58.21.1"] === "node scripts/verify-v58.21.1.mjs" ? pass("version verifier available") : fail("verify:v58.21.1 script missing or incorrect");
fileExists("scripts/verify-v58.21.1.mjs") ? pass("verify-v58.21.1 script exists") : fail("scripts/verify-v58.21.1.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.21.1");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_21_1_USER_LANGUAGE_INTERACTION_CLEANUP.md") ? pass("release notes available") : fail("v58.21.1 release notes missing");
fileIncludes("src/components/projects/project-hero-inline-editor.tsx", "Editando proyecto") ? pass("project inline language aligned") : fail("project inline editor copy not aligned");
fileIncludes("src/app/(app)/app/projects/[id]/edit/page.tsx", "mode") ? pass("project edit redirect aligned") : fail("project edit route must redirect to inline mode");
fileIncludes("src/components/tasks/task-form.tsx", "Crea una tarea clara") ? pass("task create language aligned") : fail("task create copy not aligned");
fileIncludes("src/components/projects/project-form.tsx", "Este formulario guarda solo la información necesaria") ? pass("project create language aligned") : fail("project create copy not aligned");
fileNotIncludes("src/components/projects/project-detail-pro.tsx", "Builder") ? pass("project tabs simplified") : fail("project tabs must not expose Builder");
fileNotIncludes("src/components/projects/project-detail-pro.tsx", "Prioridad</p>") ? pass("fake project priority removed") : fail("project detail must not show fake priority");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");

if (fileExists("vercel.json")) {
  const vercel = readJson("vercel.json");
  vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs");
  vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build");
} else fail("vercel.json missing");

fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.21.1 package version");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[deploy-production-readiness] OK — v58.21.1 production readiness aligned.");
