import { existsSync, readFileSync } from 'node:fs';
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

for (const rel of riskyPaths) {
  if (existsSync(path.join(cwd, rel))) {
    warnings.push(`- Found local artifact or sensitive path: ${rel}`);
  }
}

const envExamplePath = path.join(cwd, '.env.example');
if (existsSync(envExamplePath)) {
  const envExample = readFileSync(envExamplePath, 'utf8');
  if (envExample.includes('your-service-role-key')) {
    notes.push('- .env.example is templated correctly and does not expose a real service role key.');
  }
}

console.log('[security-check] Project hygiene summary');
if (warnings.length === 0) {
  console.log('- No risky local build artifacts detected in the project root.');
} else {
  for (const line of warnings) console.warn(line);
  console.warn('[security-check] Clean local artifacts before creating manual deployment bundles.');
}

if (notes.length > 0) {
  for (const line of notes) console.log(line);
}

console.log('[security-check] OK');
