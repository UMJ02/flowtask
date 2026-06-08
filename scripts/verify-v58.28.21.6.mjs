import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const expected = '58.28.21.6-data-integrity-live-sync-audit';
if (pkg.version !== expected) {
  throw new Error(`Expected package version ${expected}, got ${pkg.version}`);
}
if (pkg.scripts['verify:current'] !== 'npm run verify:v58.28.21.6') {
  throw new Error('verify:current does not point to verify:v58.28.21.6');
}
if (!pkg.scripts['build:preflight']?.includes('workspace:data-integrity-live-sync:ready')) {
  throw new Error('build:preflight does not include workspace:data-integrity-live-sync:ready');
}
console.log('verify:v58.28.21.6 OK');
