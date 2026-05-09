#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.4-design-system-governance-core-screen-migration";
const expectedVerifyCurrent = "npm run verify:v58.21.4";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.21.4");
scripts["verify:v58.21.4"] === "node scripts/verify-v58.21.4.mjs" ? pass("version verifier available") : fail("verify:v58.21.4 script missing or incorrect");
fileExists("scripts/verify-v58.21.4.mjs") ? pass("verify-v58.21.4 script exists") : fail("scripts/verify-v58.21.4.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.21.4");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_21_4_DESIGN_SYSTEM_GOVERNANCE_CORE_SCREEN_MIGRATION.md") ? pass("release notes available") : fail("v58.21.4 release notes missing");
fileExists("docs/qa/FLOWTASK_V58_21_4_DESIGN_SYSTEM_GOVERNANCE_QA.md") ? pass("QA document available") : fail("v58.21.4 QA doc missing");
fileExists("docs/design-system/FLOWTASK_DESIGN_SYSTEM.md") ? pass("design system document available") : fail("design system document missing");
fileIncludes("src/lib/design-system/tokens.ts", "export const ds") ? pass("semantic design tokens available") : fail("semantic design tokens missing");
fileExists("src/components/ui/app-page.tsx") ? pass("AppPage available") : fail("AppPage missing");
fileExists("src/components/ui/app-card.tsx") ? pass("AppCard available") : fail("AppCard missing");
fileExists("src/components/ui/app-toolbar.tsx") ? pass("AppToolbar available") : fail("AppToolbar missing");
fileIncludes("src/app/globals.css", ".ft-governed-screen") ? pass("governed screen utility available") : fail("governed screen utility missing");
fileIncludes("src/app/globals.css", ".ft-data-table") ? pass("data table utility available") : fail("data table utility missing");
fileIncludes("src/app/(app)/app/projects/page.tsx", "ft-governed-screen") ? pass("projects screen migrated") : fail("projects screen governance marker missing");
fileIncludes("src/app/(app)/app/tasks/page.tsx", "ft-governed-screen") ? pass("tasks screen migrated") : fail("tasks screen governance marker missing");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.21.4 package version");
const migrations = fileExists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_4") || file.includes("v58_21_4"))) fail("v58.21.4 must not add Supabase migrations"); else pass("no Supabase migration added");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.21.4 production readiness aligned.");
