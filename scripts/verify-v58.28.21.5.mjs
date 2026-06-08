import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (!pkg.version.includes('58.28.21.5-radar-analytics-due-state-integrity',
  '58.28.21.6-data-integrity-live-sync-audit')) {
  console.error('Expected package version 58.28.21.5-radar-analytics-due-state-integrity');
  process.exit(1);
}
console.log('verify:v58.28.21.5 OK');
