import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/components/dashboard/interactive-dashboard-board.tsx',
  'V_Report/VERSION_REPORT_v20.0.0-board-panels-inline-clean.md',
];

let failures = 0;
for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v20] V20 structure OK.\n');
