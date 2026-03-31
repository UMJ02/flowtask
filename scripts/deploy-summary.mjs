#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const checklist = [
  '.env.example',
  'README.md',
  'scripts/validate-env.mjs',
  'scripts/check-node-version.mjs',
  'scripts/preflight-report.mjs',
  'scripts/smoke-health.mjs',
  'src/app/api/health/route.ts',
  '.github/workflows/ci.yml'
];

const status = checklist.map((file) => ({ file, exists: fs.existsSync(path.join(root, file)) }));
const missing = status.filter((item) => !item.exists);

console.log(`[readiness-report] FlowTask ${pkg.version}`);
for (const item of status) {
  console.log(` - ${item.exists ? 'OK' : 'MISSING'} :: ${item.file}`);
}

if (missing.length) {
  console.error(`[readiness-report] FAILED (${missing.length} missing item(s))`);
  process.exit(1);
}

console.log('[readiness-report] Release readiness pack present');
