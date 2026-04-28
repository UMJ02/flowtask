#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  '.env.example',
  '.nvmrc',
  'README.md',
  'next.config.ts',
  'vercel.json',
  'scripts/load-env.mjs',
  'scripts/verify-v58.8.mjs',
  'scripts/hardening-final-check.mjs',
  'docs/release/V58_8_PERFORMANCE_HARDENING_FINAL.md',
  'src/lib/release/version.ts',
  'public/sw.js',
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.8] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error('[verify-v58.8] Repo verification failed.');
  process.exit(1);
}

console.log('[verify-v58.8] OK — performance + hardening final base lista para continuidad y cierre cliente.');
