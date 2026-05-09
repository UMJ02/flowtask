#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.2-layout-cleanup-feed-attachment-refinement";
const expectedVerifyCurrent = "npm run verify:v58.21.2";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function fileNotIncludes(rel, text) { return fileExists(rel) && !fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.21.2");
scripts["verify:v58.21.2"] === "node scripts/verify-v58.21.2.mjs" ? pass("version verifier available") : fail("verify:v58.21.2 script missing or incorrect");
fileExists("scripts/verify-v58.21.2.mjs") ? pass("verify-v58.21.2 script exists") : fail("scripts/verify-v58.21.2.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.21.2");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_21_2_LAYOUT_CLEANUP_FEED_ATTACHMENT_REFINEMENT.md") ? pass("release notes available") : fail("v58.21.2 release notes missing");
fileExists("docs/qa/FLOWTASK_V58_21_2_LAYOUT_FEED_ATTACHMENTS_QA.md") ? pass("QA document available") : fail("v58.21.2 QA doc missing");
fileIncludes("src/components/tasks/task-operational-feed.tsx", "Actividad del sistema") ? pass("feed split available") : fail("task operational feed not aligned");
fileIncludes("src/components/tasks/task-quick-comment-composer.tsx", "Ver menos comentarios") ? pass("comment expansion available") : fail("comment expansion missing");
fileIncludes("src/components/attachments/entity-attachments.tsx", "isImageAttachment") ? pass("attachment image previews available") : fail("attachment previews missing");
fileIncludes("src/app/(app)/app/projects/page.tsx", "Más filtros") ? pass("project filters simplified") : fail("project filters cleanup missing");
fileNotIncludes("src/app/(app)/app/projects/page.tsx", "<th className=\"px-5 py-4\">Prioridad</th>") ? pass("fake priority column removed") : fail("projects table must not expose fake priority column");
fileIncludes("src/components/projects/project-inline-tasks.tsx", "xl:grid-cols-[minmax(220px,1fr)_170px_150px_minmax(190px,240px)_130px]") ? pass("project task quick-add responsive") : fail("project task quick-add responsive grid missing");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.21.2 package version");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.21.2 production readiness aligned.");
