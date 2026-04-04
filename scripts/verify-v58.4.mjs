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
  'docs/release/V58_4_BUILD_DEPLOY_READINESS.md',
  '.env.example',
  '.nvmrc',
  'vercel.json',
  'README.md',
  'scripts/build-deploy-readiness.mjs',
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
  'tsconfig.tsbuildinfo',
];

const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
const forbidden = forbiddenAtRoot.filter((name) => fs.existsSync(path.join(root, name)));

if (missing.length || forbidden.length) {
  console.error('[verify-v58.4] Repo verification failed.');
  if (missing.length) console.error('Missing required paths:', missing.join(', '));
  if (forbidden.length) console.error('Forbidden root items detected:', forbidden.join(', '));
  process.exit(1);
}

console.log('[verify-v58.4] OK — build & deploy readiness base limpia y lista para continuar.');
