import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  'package.json',
  'README.md',
  'README_V7_CLIENT_READY.md',
  'src/app/globals.css',
  'src/components/layout/app-shell.tsx',
  'src/components/dashboard/dashboard-hero.tsx',
  'src/components/tasks/task-list.tsx',
  'src/components/tasks/task-detail-summary.tsx',
  'src/components/projects/project-detail-summary.tsx',
  'scripts/functional-qa.mjs',
  'scripts/ux-review.mjs',
  'scripts/release-check.mjs',
  'V_Report/VERSION_REPORT_v8.0.0-release-candidate-full.md',
  'V_Report/RELEASE_CANDIDATE_CHECKLIST_v8.md',
];

let failures = 0;

console.log('\n[release-check] Flowtask V8 release candidate\n');

for (const file of requiredFiles) {
  const full = path.join(root, file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  console.log('\n[release-check] Env coverage');
  for (const key of requiredEnv) {
    const ok = text.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failures += 1;
  }
}

console.log('\n[release-check] Manual release gates');
console.log('1. Login and logout');
console.log('2. Register and email confirmation branch');
console.log('3. Dashboard with and without data');
console.log('4. Task create/edit/delete');
console.log('5. Project create/edit/delete');
console.log('6. Notifications load');
console.log('7. Health and ready endpoints');
console.log('8. Mobile smoke review');
console.log('9. Build');
console.log('10. Production env validation');

if (failures > 0) {
  console.error(`\n[release-check] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[release-check] All release candidate checks passed.\n');
