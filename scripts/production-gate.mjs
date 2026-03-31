import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  'package.json',
  'scripts/functional-qa.mjs',
  'scripts/ux-review.mjs',
  'scripts/release-check.mjs',
  'scripts/preprod-validate.mjs',
  'scripts/production-gate.mjs',
  'V_Report/VERSION_REPORT_v10.0.0-final-deploy-ready.md',
  'V_Report/FINAL_DEPLOY_CHECKLIST_v10.md',
  'V_Report/PRODUCTION_GATE_v10.md',
  'V_Report/HANDOFF_FINAL_v10.md',
  'README_V10_FINAL.md',
];

let failures = 0;

console.log('\n[production-gate] Flowtask V10 final deploy gate\n');

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
  ];
  console.log('\n[production-gate] Environment contract');
  for (const key of requiredEnv) {
    const ok = text.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failures += 1;
  }
}

console.log('\n[production-gate] Final manual gates');
console.log('1. Login and logout with real user');
console.log('2. Register flow and confirmation branch');
console.log('3. Forgot/reset password flow');
console.log('4. Dashboard loads with and without data');
console.log('5. Task CRUD works end-to-end');
console.log('6. Project CRUD works end-to-end');
console.log('7. Notifications load without runtime errors');
console.log('8. /api/health and /api/ready return 200');
console.log('9. Mobile smoke validation completed');
console.log('10. Production build completed');

if (failures > 0) {
  console.error(`\n[production-gate] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[production-gate] All final deploy checks passed.\n');
