import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const checks = [
  { label: 'Public login route', file: 'src/app/(public)/login/page.tsx' },
  { label: 'Public register route', file: 'src/app/(public)/register/page.tsx' },
  { label: 'Forgot password route', file: 'src/app/(public)/forgot-password/page.tsx' },
  { label: 'App layout shell', file: 'src/app/(app)/app/layout.tsx' },
  { label: 'Health endpoint', file: 'src/app/api/health/route.ts' },
  { label: 'Ready endpoint', file: 'src/app/api/ready/route.ts' },
  { label: 'Runtime check script', file: 'scripts/runtime-check.mjs' },
  { label: 'Supabase doctor script', file: 'scripts/supabase-doctor.mjs' },
  { label: 'Env example', file: '.env.example' }
];

let failed = 0;

console.log('\n[functional-qa] Flowtask V6 functional QA precheck\n');

for (const check of checks) {
  const full = path.join(root, check.file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${check.label} -> ${check.file}`);
  if (!ok) failed += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const envText = fs.readFileSync(envExample, 'utf8');
  const envChecks = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  console.log('\n[functional-qa] Env contract');
  for (const key of envChecks) {
    const ok = envText.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failed += 1;
  }
}

console.log('\n[functional-qa] Manual smoke flow recommended');
console.log('1. Login');
console.log('2. Register');
console.log('3. Dashboard load');
console.log('4. Create task');
console.log('5. Edit task');
console.log('6. Create project');
console.log('7. Edit project');
console.log('8. Notifications load');
console.log('9. Health/ready endpoints');
console.log('10. Logout');

if (failed > 0) {
  console.error(`\n[functional-qa] Completed with ${failed} failing prechecks.`);
  process.exit(1);
}

console.log('\n[functional-qa] All structural prechecks passed.\n');
