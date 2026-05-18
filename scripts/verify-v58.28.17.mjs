import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = fs.readFileSync('src/lib/release/version.ts', 'utf8');
const failures = [];

const expected = '58.28.17-classic-pro-unified-data-qa-final-user-flow';
if (pkg.version !== expected) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.28.17') failures.push('verify:current must target verify:v58.28.17');
if (!version.includes(expected)) failures.push('src/lib/release/version.ts must contain v58.28.17 slug');
if (!pkg.scripts?.['workspace:unified-data-qa:ready']) failures.push('Missing workspace:unified-data-qa:ready script');
if (!pkg.scripts?.['build:preflight']?.includes('workspace:unified-data-qa:ready')) failures.push('build:preflight must include workspace:unified-data-qa:ready');

if (failures.length) {
  console.error('[verify:v58.28.17] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.28.17] OK — Classic + Pro unified data QA and final user flow aligned.');
