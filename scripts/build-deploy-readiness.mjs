import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function requireFile(rel) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures.push(`Missing required file: ${rel}`);
  }
}

function requireIncludes(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${rel}`);
    return;
  }
  const content = fs.readFileSync(full, 'utf8');
  if (!content.includes(text)) {
    failures.push(`Expected '${text}' in ${rel}`);
  }
}

requireFile('package.json');
requireFile('vercel.json');
requireFile('next.config.ts');
requireFile('.nvmrc');
requireFile('scripts/runtime-check.mjs');
requireFile('scripts/validate-env.mjs');
requireFile('scripts/verify-v58.8.1.mjs');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = pkg.scripts ?? {};
for (const scriptName of ['build', 'vercel:build', 'vercel:preflight', 'vercel:deploy-check', 'deploy:readiness', 'build:preflight']) {
  if (!scripts[scriptName]) failures.push(`Missing package script: ${scriptName}`);
}

if (pkg.version !== '58.8.1-deploy-fix') {
  failures.push(`Unexpected package version: ${pkg.version}`);
}

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (vercel.framework !== 'nextjs') failures.push('vercel.json framework must be nextjs');
if (vercel.buildCommand !== 'npm run vercel:build') failures.push('vercel.json buildCommand must be npm run vercel:build');
if (!['npm ci', 'npm install'].includes(vercel.installCommand)) failures.push('vercel.json installCommand must be npm ci or npm install');

requireIncludes('.env.example', 'NEXT_PUBLIC_SUPABASE_URL');
requireIncludes('.env.example', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
requireIncludes('.env.example', 'NEXT_PUBLIC_APP_URL');
requireIncludes('.env.example', 'SUPABASE_SERVICE_ROLE_KEY');
requireIncludes('src/lib/release/version.ts', '58.8.1-deploy-fix');
requireIncludes('README.md', 'V58.8.1');

if (failures.length) {
  console.error('[build-deploy-readiness] Failed checks:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[build-deploy-readiness] OK — package, env, node reference y deploy config alineados.');
