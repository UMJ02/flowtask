#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.2-layout-cleanup-feed-attachment-refinement";
const expectedReleaseLabel = "v58.21.2 Layout Cleanup + Feed & Attachment Refinement";
function requireFile(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { const full = path.join(root, rel); if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; } const content = fs.readFileSync(full, "utf8"); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text) { const full = path.join(root, rel); if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; } const content = fs.readFileSync(full, "utf8"); if (content.includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }
["package.json","package-lock.json","vercel.json","next.config.ts",".nvmrc",".env.example","scripts/runtime-check.mjs","scripts/validate-env.mjs","scripts/verify-v58.21.2.mjs","docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md","docs/release/V58_21_2_LAYOUT_CLEANUP_FEED_ATTACHMENT_REFINEMENT.md","docs/qa/FLOWTASK_V58_21_2_LAYOUT_FEED_ATTACHMENTS_QA.md"].forEach(requireFile);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};
for (const scriptName of ["build", "vercel:build", "deploy:readiness", "build:preflight", "verify:current", "deploy:production:ready", "verify:v58.21.2"]) if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.2") failures.push("verify:current must target verify:v58.21.2");
if (scripts["verify:v58.21.2"] !== "node scripts/verify-v58.21.2.mjs") failures.push("verify:v58.21.2 must target scripts/verify-v58.21.2.mjs");
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
requireIncludes("src/components/tasks/task-operational-feed.tsx", "Actividad del sistema");
requireIncludes("src/components/attachments/entity-attachments.tsx", "isImageAttachment");
requireIncludes("src/app/(app)/app/projects/page.tsx", "Más filtros");
requireNotIncludes("src/app/(app)/app/projects/page.tsx", "<th className=\"px-5 py-4\">Prioridad</th>");
requireIncludes("docs/release/V58_21_2_LAYOUT_CLEANUP_FEED_ATTACHMENT_REFINEMENT.md", "Layout Cleanup + Feed & Attachment Refinement");
requireIncludes("docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md", "0001-0034");
if (failures.length) { console.error("[build-deploy-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[build-deploy-readiness] OK — v58.21.2 package, env, release exports and layout cleanup readiness aligned.");
