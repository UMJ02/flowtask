import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/components/workspace/floating-actions.tsx',
  'V_Report/VERSION_REPORT_v22.0.0-floating-tab-center-color-pulse.md',
];

let failures = 0;
for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v22] V22 structure OK.\n');
