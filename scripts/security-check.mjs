import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const riskyPaths = [
  '.next',
  'node_modules',
  'tsconfig.tsbuildinfo',
  '.DS_Store',
  '__MACOSX',
  '.git',
  '.env',
  '.env.local',
];

const warnings = [];
const notes = [];
const failures = [];

for (const rel of riskyPaths) {
  if (fs.existsSync(path.join(cwd, rel))) {
    warnings.push(`- Found local/private artifact in release base: ${rel}`);
  }
}

const envExamplePath = path.join(cwd, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  failures.push('- Missing .env.example');
}

const packageJsonPath = path.join(cwd, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const buildScript = pkg.scripts?.build ?? '';
  if (!String(buildScript).includes('next build')) {
    failures.push('- package.json build script does not execute Next.js build');
  }
}

const srcRoot = path.join(cwd, 'src');
const leakMatches = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (/SUPABASE_SERVICE_ROLE_KEY/.test(text) && /NEXT_PUBLIC/i.test(text)) {
      leakMatches.push(path.relative(cwd, full));
    }
    if (/service_role/i.test(text) && /NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(text)) {
      leakMatches.push(path.relative(cwd, full));
    }
  }
}

walk(srcRoot);

if (leakMatches.length > 0) {
  failures.push(`- Potential service-role exposure patterns detected in src: ${leakMatches.join(', ')}`);
}

if (fs.existsSync(path.join(cwd, '.env.local'))) {
  notes.push('- .env.local detected locally. Keep it only on developer machines and configure Production vars in Vercel Settings.');
}

console.log('[security-check] Project hygiene + release hardening summary');
if (warnings.length === 0) {
  console.log('- No risky local/private artifacts detected in the release base.');
} else {
  for (const line of warnings) console.warn(line);
}

if (notes.length > 0) {
  for (const line of notes) console.log(line);
}

if (failures.length > 0) {
  for (const line of failures) console.error(line);
  process.exit(1);
}

console.log('[security-check] OK');
