import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  ".env.example",
  "package.json",
  "README.md",
  "src/app/globals.css",
  "src/components/layout/app-shell.tsx",
  "src/components/tasks/task-list.tsx",
  "src/components/projects/project-detail-summary.tsx",
  "scripts/runtime-check.mjs",
  "scripts/security-check.mjs",
  "scripts/release-check.mjs",
  "src/lib/release/version.ts",
  "archive/internal/README.md",
  "supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql"
];

const forbiddenPaths = [
  ".env",
  ".env.local",
  ".next",
  "node_modules",
  ".git",
  "RT_modulos"
];

let failures = 0;

console.log("\n[release-check] FlowTask repo cleanup + canonical history\n");

for (const file of requiredFiles) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? "PASS" : "FAIL"}  ${file}`);
  if (!ok) failures += 1;
}

console.log("\n[release-check] Forbidden root paths");
for (const rel of forbiddenPaths) {
  const exists = fs.existsSync(path.join(root, rel));
  console.log(`${!exists ? "PASS" : "FAIL"}  ${rel}`);
  if (exists) failures += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  console.log('\n[release-check] Env coverage');
  for (const key of requiredEnv) {
    const ok = text.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failures += 1;
  }
}

console.log('\n[release-check] Canonical DB history');
const archiveSql = path.join(root, 'archive/internal/legacy_release_history/RT_modulos');
const canonicalSql = path.join(root, 'supabase/migrations');
console.log(`${fs.existsSync(canonicalSql) ? 'PASS' : 'FAIL'}  supabase/migrations`);
console.log(`${fs.existsSync(archiveSql) ? 'PASS' : 'FAIL'}  archive/internal/legacy_release_history/RT_modulos`);
if (!fs.existsSync(canonicalSql) || !fs.existsSync(archiveSql)) failures += 1;

if (failures > 0) {
  console.error(`\n[release-check] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[release-check] All repo cleanup checks passed.\n');
