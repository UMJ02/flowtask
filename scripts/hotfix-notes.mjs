import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  'src/app/globals.css',
  'src/components/ui/card.tsx',
  'supabase/sql/v11_hotfix_organization_members_rls.sql',
  'V_Report/VERSION_REPORT_v11.0.0-hotfix-build-rls.md',
  'README_V11_HOTFIX.md',
];

let failures = 0;

console.log('\n[hotfix-notes] Flowtask V11 hotfix verification\n');

for (const file of checks) {
  const full = path.join(root, file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

console.log('\n[hotfix-notes] Manual steps');
console.log('1. Run npm run build');
console.log('2. Open app in dev mode and recheck the React 418 error');
console.log('3. Run the SQL hotfix in Supabase');
console.log('4. Reload workspace and verify organization_members no longer returns 500');

if (failures > 0) {
  console.error(`\n[hotfix-notes] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[hotfix-notes] Hotfix files are present.\n');
