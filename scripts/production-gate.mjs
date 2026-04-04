#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  '.nvmrc',
  'package.json',
  'vercel.json',
  'README.md',
  'docs/release/CLIENT_RELEASE_CHECKLIST.md',
  'docs/release/OPERATIONS_HANDOFF.md',
  'docs/release/V58_7_DEPLOY_PRODUCTION_REAL.md',
  'docs/release/DEPLOY_PRODUCTION_RUNBOOK.md',
  'scripts/functional-qa.mjs',
  'scripts/ux-review.mjs',
  'scripts/release-check.mjs',
  'scripts/preprod-validate.mjs',
  'scripts/production-gate.mjs',
  'scripts/deploy-production-readiness.mjs',
  'scripts/postdeploy-smoke.mjs',
  'src/app/api/health/route.ts',
  'src/app/api/ready/route.ts',
  '.github/workflows/ci.yml',
];

let failures = 0;

console.log('\n[production-gate] FlowTask V58.7 production gate\n');

for (const file of requiredFiles) {
  const full = path.join(root, file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  console.log('\n[production-gate] Environment contract');
  for (const key of requiredEnv) {
    const ok = text.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failures += 1;
  }
}

console.log('\n[production-gate] Final manual gates');
console.log('1. Vercel project linked and production env vars configured');
console.log('2. npm run vercel:preflight completed locally');
console.log('3. npm run build completed in a clean environment');
console.log('4. Login and logout validated with a real user');
console.log('5. Client / Project / Task CRUD validated end-to-end');
console.log('6. Board and agenda daily flow validated without runtime errors');
console.log('7. /api/health and /api/ready return 200 in deployed env');
console.log('8. Postdeploy smoke completed against production URL');
console.log('9. Mobile smoke validation completed');
console.log('10. Rollback point documented before public release');

if (failures > 0) {
  console.error(`\n[production-gate] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[production-gate] All production gate checks passed.\n');
