#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routePath = path.join(root, 'src', 'app', 'api', 'health', 'route.ts');
const envPath = path.join(root, '.env.local');
const envExamplePath = path.join(root, '.env.example');

const problems = [];

if (!fs.existsSync(routePath)) {
  problems.push('Missing health route at src/app/api/health/route.ts');
}

if (!fs.existsSync(envExamplePath)) {
  problems.push('Missing .env.example template');
}

if (!fs.existsSync(envPath)) {
  console.log('[smoke-health] .env.local not found. Continuing with structural smoke validation only.');
}

if (problems.length) {
  console.error('[smoke-health] FAILED');
  for (const item of problems) console.error(` - ${item}`);
  process.exit(1);
}

console.log('[smoke-health] OK');
console.log(' - Health route present');
console.log(' - Environment template present');
console.log(' - Structural smoke validation passed');
