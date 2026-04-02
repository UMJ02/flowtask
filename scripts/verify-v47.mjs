import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobile = fs.readFileSync(path.join(root, 'src/components/layout/mobile-nav.tsx'), 'utf8');

const checks = [
  ['mobile menu uses portal', mobile.includes('createPortal(panel, document.body)')),
  ['mobile menu locks body scroll', mobile.includes("document.body.style.overflow = 'hidden'")),
  ['panel is fixed fullscreen layer', mobile.includes('fixed inset-0 z-[140] md:hidden')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v47] V47 checks OK.\n');
