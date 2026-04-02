import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobile = fs.readFileSync(path.join(root, 'src/components/layout/mobile-nav.tsx'), 'utf8');
const user = fs.readFileSync(path.join(root, 'src/components/layout/user-menu.tsx'), 'utf8');

const checks = [
  ['mobile drawer no longer full height', mobile.includes('max-h-[calc(100vh-1rem)]') && mobile.includes('rounded-r-[32px]')),
  ['mobile logout item exists', mobile.includes('Cerrar sesión') && mobile.includes('Salir del workspace')),
  ['mobile profile redirects directly', user.includes('href="/app/settings"') && user.includes('md:hidden')),
  ['desktop dropdown preserved', user.includes('hidden md:block')),
];

let failures = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1
}
if (failures > 0) process.exit(1)
console.log('\n[verify:v49] V49 checks OK.\n')
