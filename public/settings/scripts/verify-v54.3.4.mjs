import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredPaths = [
  'src',
  'public',
  'supabase/migrations',
  'archive/internal',
  'docs/release/CLIENT_RELEASE_CHECKLIST.md',
  'docs/release/OPERATIONS_HANDOFF.md',
  '.env.example',
  'README.md',
];

const forbiddenAtRoot = [
  'node_modules',
  '.next',
  '.git',
  '.env',
  '.env.local',
  '__MACOSX',
  '.DS_Store',
  'RT_modulos',
];

const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
const forbidden = forbiddenAtRoot.filter((name) => fs.existsSync(path.join(root, name)));

if (missing.length || forbidden.length) {
  console.error('[verify-v54.3.4] Repo verification failed.');
  if (missing.length) console.error('Missing required paths:', missing.join(', '));
  if (forbidden.length) console.error('Forbidden root items detected:', forbidden.join(', '));
  process.exit(1);
}

console.log('[verify-v54.3.4] OK — repo limpio, archivo interno aislado y documentación de release lista.');
