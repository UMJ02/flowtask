import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');

const checks = [
  ['video uses absolute public path', home.includes('src="/videos/videointro.mp4"')],
  ['video uses direct src attribute', home.includes('<video') && home.includes('src="/videos/videointro.mp4"')],
  ['manifest removed from metadata to avoid 401 noise', !layout.includes('manifest:') && layout.includes('export const metadata')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v39] V39 checks OK.\n');
