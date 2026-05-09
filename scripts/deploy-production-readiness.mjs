#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.8-spacing-governance-microinteraction-polish";
const expectedVerifyCurrent = "npm run verify:v58.21.8";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.21.8");
scripts["verify:v58.21.8"] === "node scripts/verify-v58.21.8.mjs" ? pass("version verifier available") : fail("verify:v58.21.8 script missing or incorrect");
fileExists("scripts/verify-v58.21.8.mjs") ? pass("verify-v58.21.8 script exists") : fail("scripts/verify-v58.21.8.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.21.8");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_21_8_SPACING_GOVERNANCE_MICROINTERACTION_POLISH.md") ? pass("release notes available") : fail("v58.21.8 release notes missing");
fileExists("docs/qa/FLOWTASK_V58_21_8_SPACING_MOTION_QA.md") ? pass("QA document available") : fail("v58.21.8 QA doc missing");
fileExists("docs/design-system/FLOWTASK_SPACING_MOTION_GOVERNANCE.md") ? pass("spacing governance design system document available") : fail("spacing governance design system document missing");
fileIncludes("src/lib/design-system/tokens.ts", "spacing-governance-compact") ? pass("spacing governance density token available") : fail("spacing governance density token missing");
fileIncludes("src/lib/design-system/tokens.ts", "spacingGovernance") ? pass("spacing governance policy available") : fail("spacing governance policy missing");
fileIncludes("src/app/globals.css", ".ft-overlay-card") ? pass("overlay card variant available") : fail("overlay card variant missing");
!fileIncludes("src/app/globals.css", 'body [class*="shadow') ? pass("global shadow override removed") : fail("global shadow override must be removed");
fileIncludes("src/app/globals.css", ".ft-motion-pop") ? pass("pop motion utility available") : fail("pop motion utility missing");
fileIncludes("src/app/globals.css", ".ft-arrow-action") ? pass("arrow action microinteraction available") : fail("arrow action microinteraction missing");
fileIncludes("src/components/ui/button.tsx", "h-9 rounded-[10px]") ? pass("compact button scale available") : fail("compact button scale missing");
fileIncludes("src/components/ui/input.tsx", "h-9 w-full rounded-[10px]") ? pass("compact input scale available") : fail("compact input scale missing");
fileIncludes("src/components/ui/app-card.tsx", "floating") ? pass("floating card variant available") : fail("floating card variant missing");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.21.8 package version");
const migrations = fileExists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_21_8") || file.includes("v58_21_8"))) fail("v58.21.8 must not add Supabase migrations"); else pass("no Supabase migration added");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.21.8 production readiness aligned.");
