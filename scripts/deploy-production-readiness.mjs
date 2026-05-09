#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.22.0-semantic-ui-classes-density-contracts";
const expectedVerifyCurrent = "npm run verify:v58.22.0";
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); }
function fileExists(rel) { return fs.existsSync(path.join(root, rel)); }
function fileIncludes(rel, text) { return fileExists(rel) && fs.readFileSync(path.join(root, rel), "utf8").includes(text); }
function pass(label) { console.log(`[deploy-production-readiness] OK - ${label}`); }
function fail(label) { failures.push(label); }
const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};
pkg.version === expectedVersion ? pass("package version aligned") : fail(`package version must be ${expectedVersion}`);
scripts["verify:current"] === expectedVerifyCurrent ? pass("verify current aligned") : fail("verify:current must target verify:v58.22.0");
scripts["verify:v58.22.0"] === "node scripts/verify-v58.22.0.mjs" ? pass("version verifier available") : fail("verify:v58.22.0 script missing or incorrect");
fileExists("scripts/verify-v58.22.0.mjs") ? pass("verify-v58.22.0 script exists") : fail("scripts/verify-v58.22.0.mjs missing");
fileIncludes("src/lib/release/version.ts", expectedVersion) ? pass("runtime version export aligned") : fail("src/lib/release/version.ts must export v58.22.0");
fileIncludes("src/lib/release/version.ts", "production-candidate") ? pass("release stage aligned") : fail("src/lib/release/version.ts must include production-candidate");
fileExists("docs/release/V58_22_0_SEMANTIC_UI_CLASSES_DENSITY_CONTRACTS.md") ? pass("release notes available") : fail("v58.22.0 release notes missing");
fileExists("docs/qa/FLOWTASK_V58_22_0_SEMANTIC_UI_DENSITY_QA.md") ? pass("QA document available") : fail("v58.22.0 QA doc missing");
fileExists("docs/design-system/FLOWTASK_SEMANTIC_UI_DENSITY_CONTRACTS.md") ? pass("semantic UI density document available") : fail("semantic UI density document missing");
for (const [label, rel, text] of [
  ["semantic title classes available", "src/app/globals.css", "ft-title-page"],
  ["density contracts available", "src/app/globals.css", "ft-density-create"],
  ["semantic button classes available", "src/app/globals.css", "ft-btn-primary"],
  ["semantic input classes available", "src/app/globals.css", "ft-input"],
  ["semantic tokens exported", "src/lib/design-system/tokens.ts", "semanticClasses"],
  ["density contracts exported", "src/lib/design-system/tokens.ts", "densityContracts"],
  ["AppPage density data available", "src/components/ui/app-page.tsx", "data-density"],
  ["Button migrated to semantic classes", "src/components/ui/button.tsx", "ft-btn-primary"],
  ["Input migrated to semantic classes", "src/components/ui/input.tsx", "ft-input"],
]) fileIncludes(rel, text) ? pass(label) : fail(`${label} missing`);
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL") ? pass("Supabase URL env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_URL");
fileIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY") ? pass("Supabase anon env documented") : fail(".env.example missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
fileIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY") ? pass("Supabase service role env documented") : fail(".env.example missing SUPABASE_SERVICE_ROLE_KEY");
if (fileExists("vercel.json")) { const vercel = readJson("vercel.json"); vercel.framework === "nextjs" ? pass("Vercel framework aligned") : fail("vercel.json framework must be nextjs"); vercel.buildCommand === "npm run vercel:build" ? pass("Vercel build command aligned") : fail("vercel.json buildCommand must be npm run vercel:build"); } else fail("vercel.json missing");
fileIncludes("package-lock.json", expectedVersion) ? pass("package-lock version aligned") : fail("package-lock.json must include v58.22.0 package version");
const migrations = fileExists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")) : [];
if (migrations.some((file) => file.includes("58_22_0") || file.includes("v58_22_0"))) fail("v58.22.0 must not add Supabase migrations"); else pass("no Supabase migration added");
if (failures.length) { console.error("[deploy-production-readiness] Failed checks:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[deploy-production-readiness] OK — v58.22.0 production readiness aligned.");
