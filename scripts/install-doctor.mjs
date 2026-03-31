#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const checks = [
  { label: 'node_modules', file: 'node_modules' },
  { label: 'Next CLI', file: 'node_modules/next/dist/bin/next' },
  { label: 'React', file: 'node_modules/react/index.js' },
  { label: 'React DOM', file: 'node_modules/react-dom/index.js' },
  { label: 'TypeScript', file: 'node_modules/typescript/bin/tsc' },
];

let failed = false;
console.log('[install-doctor] Checking local installation integrity...');
for (const check of checks) {
  const target = path.join(cwd, check.file);
  const ok = fs.existsSync(target);
  console.log(`${ok ? '✓' : '✗'} ${check.label}: ${check.file}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error('\n[install-doctor] Incomplete install detected. Recommended recovery:');
  console.error('  rm -rf node_modules .next package-lock.json');
  console.error('  npm install');
  process.exit(1);
}

console.log('\n[install-doctor] Local dependencies look present.');
