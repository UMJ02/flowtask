import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scriptsDir = path.join(root, "scripts");
const archiveScriptsDir = path.join(root, "archive/internal/legacy_release_history/scripts");
let failures = 0;

console.log("\n[verify-v54.3.2] FlowTask release flow consolidation\n");

const mustExist = [
  "package.json",
  "README.md",
  ".env.example",
  "archive/internal/README.md",
  "archive/internal/legacy_release_history/RT_modulos",
  "archive/internal/legacy_release_history/scripts/verify-v54.3.mjs",
  "archive/internal/legacy_release_history/scripts/verify-v54.3.1.mjs",
  "archive/internal/legacy_release_history/scripts/runtime-check.ts",
  "archive/internal/legacy_release_history/scripts/release-check.ts",
  "scripts/runtime-check.mjs",
  "scripts/release-check.mjs",
  "scripts/verify-v54.3.2.mjs",
  "supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql",
  "src/lib/release/version.ts"
];
for (const rel of mustExist) {
  const ok = fs.existsSync(path.join(root, rel));
  console.log(`${ok ? "PASS" : "FAIL"}  ${rel}`);
  if (!ok) failures += 1;
}

console.log("\n[verify-v54.3.2] Forbidden root paths");
for (const rel of ["RT_modulos", ".env", ".env.local", ".next", "node_modules", ".git"]) {
  const ok = !fs.existsSync(path.join(root, rel));
  console.log(`${ok ? "PASS" : "FAIL"}  ${rel}`);
  if (!ok) failures += 1;
}

console.log("\n[verify-v54.3.2] Root scripts cleanup");
const rootScripts = fs.existsSync(scriptsDir) ? fs.readdirSync(scriptsDir) : [];
for (const forbidden of ["verify-v54.3.mjs", "verify-v54.3.1.mjs", "runtime-check.ts", "release-check.ts"]) {
  const ok = !rootScripts.includes(forbidden);
  console.log(`${ok ? "PASS" : "FAIL"}  scripts/${forbidden}`);
  if (!ok) failures += 1;
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
console.log("\n[verify-v54.3.2] package.json");
const requiredScripts = [
  "verify:v54.3.2",
  "release:repo:v54.3.2",
  "release:repo:current",
  "qa:current",
  "release:current",
  "runtime:check",
  "security:check",
  "performance:check",
  "ops:check"
];
for (const name of requiredScripts) {
  const ok = Boolean(packageJson.scripts?.[name]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures += 1;
}
for (const name of ["verify:v54.3", "release:repo:v54.3", "verify:v54.3.1", "release:repo:v54.3.1"]) {
  const ok = !packageJson.scripts?.[name];
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures += 1;
}
if (packageJson.version !== "54.3.2-release-flow-consolidation") {
  console.log(`FAIL  version=${packageJson.version}`);
  failures += 1;
} else {
  console.log("PASS  version=54.3.2-release-flow-consolidation");
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
const versionMarkers = [
  '54.3.2-release-flow-consolidation',
  'v54.3.2 Release Flow Consolidation'
];
console.log("\n[verify-v54.3.2] Release version markers");
for (const marker of versionMarkers) {
  const ok = versionFile.includes(marker);
  console.log(`${ok ? "PASS" : "FAIL"}  ${marker}`);
  if (!ok) failures += 1;
}

if (failures > 0) {
  console.error(`\n[verify-v54.3.2] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log("\n[verify-v54.3.2] Release flow consolidation checks passed.\n");
