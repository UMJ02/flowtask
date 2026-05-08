#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.1-user-language-interaction-cleanup";
const expectedReleaseLabel = "v58.21.1 User Language + Interaction Cleanup";

function requireFile(rel) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`);
}
function requireIncludes(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; }
  const content = fs.readFileSync(full, "utf8");
  if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`);
}
function requireNotIncludes(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; }
  const content = fs.readFileSync(full, "utf8");
  if (content.includes(text)) failures.push(`Did not expect '${text}' in ${rel}`);
}

requireFile("package.json");
requireFile("package-lock.json");
requireFile("vercel.json");
requireFile("next.config.ts");
requireFile(".nvmrc");
requireFile(".env.example");
requireFile("scripts/runtime-check.mjs");
requireFile("scripts/validate-env.mjs");
requireFile("scripts/verify-v58.21.1.mjs");
requireFile("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md");
requireFile("docs/release/V58_21_1_USER_LANGUAGE_INTERACTION_CLEANUP.md");

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build", "vercel:build", "deploy:readiness", "build:preflight", "verify:current", "deploy:production:ready", "verify:v58.21.1"]) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.1") failures.push("verify:current must target verify:v58.21.1");
if (scripts["verify:v58.21.1"] !== "node scripts/verify-v58.21.1.mjs") failures.push("verify:v58.21.1 must target scripts/verify-v58.21.1.mjs");

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");
if (!["npm ci", "npm install"].includes(vercel.installCommand)) failures.push("vercel.json installCommand must be npm ci or npm install");

requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL");
requireIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
requireIncludes(".env.example", "NEXT_PUBLIC_APP_URL");
requireIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY");
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedReleaseLabel);
requireIncludes("src/lib/release/version.ts", "production-candidate");
requireIncludes("src/components/projects/project-hero-inline-editor.tsx", "Editando proyecto");
requireIncludes("src/app/(app)/app/projects/[id]/edit/page.tsx", "mode");
requireIncludes("src/components/tasks/task-form.tsx", "Crea una tarea clara");
requireIncludes("src/components/projects/project-form.tsx", "Este formulario guarda solo la información necesaria");
requireNotIncludes("src/components/projects/project-detail-pro.tsx", "Builder");
requireIncludes("docs/release/V58_21_1_USER_LANGUAGE_INTERACTION_CLEANUP.md", "User Language + Interaction Cleanup");
requireIncludes("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md", "0001-0034");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[build-deploy-readiness] OK — v58.21.1 package, env, release exports and user language cleanup readiness aligned.");
