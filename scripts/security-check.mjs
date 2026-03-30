import { existsSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const riskyPaths = [
  '.next',
  'node_modules',
  'tsconfig.tsbuildinfo',
  '.DS_Store',
  '__MACOSX',
];

const warnings = [];
const notes = [];

for (const rel of riskyPaths) {
  if (existsSync(path.join(cwd, rel))) {
    warnings.push(`- Found local artifact: ${rel}`);
  }
}

if (existsSync(path.join(cwd, '.env.local'))) {
  notes.push('- .env.local detected locally. Keep it out of Git/Vercel uploads and set Production vars in Vercel Settings.');
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
