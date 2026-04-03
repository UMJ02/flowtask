import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/app/(app)/app/dashboard/page.tsx',
  'src/components/workspace/floating-actions.tsx',
  'V_Report/VERSION_REPORT_v21.0.0-workspace-simplified-floating-actions.md',
];

let failures = 0;
for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v21] V21 structure OK.\n');
