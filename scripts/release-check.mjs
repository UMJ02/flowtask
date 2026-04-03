import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  '.gitignore',
  'package.json',
  'README.md',
  'src/app/globals.css',
  'src/components/layout/app-shell.tsx',
  'src/components/tasks/task-list.tsx',
  'src/components/projects/project-detail-summary.tsx',
  'scripts/runtime-check.mjs',
  'scripts/security-check.mjs',
  'scripts/release-check.mjs',
  'scripts/verify-v55.mjs',
  'src/lib/release/version.ts',
  'archive/internal/README.md',
  'docs/release/CLIENT_RELEASE_CHECKLIST.md',
  'docs/release/OPERATIONS_HANDOFF.md',
  'docs/release/V55_HARDENING_CHECKLIST.md',
  'docs/release/V55_DELIVERY_NOTES.md',
  'supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql'
];

const forbiddenPaths = [
  '.env',
  '.env.local',
  '.next',
  'node_modules',
  '.git',
  'RT_modulos',
  '__MACOSX',
  '.DS_Store',
  'tsconfig.tsbuildinfo'
];

let failures = 0;

console.log('\n[release-check] FlowTask repo cleanup + production hardening\n');

for (const file of requiredFiles) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

console.log('\n[release-check] Forbidden root paths');
for (const rel of forbiddenPaths) {
  const exists = fs.existsSync(path.join(root, rel));
  console.log(`${!exists ? 'PASS' : 'FAIL'}  ${rel}`);
  if (exists) failures += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_ENABLE_REALTIME',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REMINDER_EMAIL_WEBHOOK_URL',
    'REMINDER_WHATSAPP_WEBHOOK_URL',
    'REMINDER_FROM_EMAIL',
    'NOTIFICATION_MAX_ATTEMPTS',
    'NOTIFICATION_RETRY_DELAY_MINUTES'
  ];
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

console.log('\n[release-check] All repo cleanup + hardening checks passed.\n');
