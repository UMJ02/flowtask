#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const requiredPaths = [
  'src',
  'public',
  'supabase/migrations',
  'archive/internal/legacy_release_history',
  'scripts/runtime-check.mjs',
  'scripts/release-check.mjs',
  '.env.example',
  'README.md'
];

const forbiddenRootEntries = [
  'RT_modulos',
  '__MACOSX',
  '.DS_Store',
  '.next',
  'node_modules',
  '.git',
  '.env',
  '.env.local',
  'testfile'
];

const missing = requiredPaths.filter((p) => !fs.existsSync(path.join(root, p)));
const presentForbidden = forbiddenRootEntries.filter((p) => fs.existsSync(path.join(root, p)));

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const versionOk = packageJson.version === '54.3.3-release-package-streamline';

const messages = [];
if (!versionOk) messages.push(`package.json version mismatch: ${packageJson.version}`);
if (missing.length) messages.push(`missing required paths: ${missing.join(', ')}`);
if (presentForbidden.length) messages.push(`forbidden entries still present: ${presentForbidden.join(', ')}`);

if (messages.length) {
  console.error('[verify-v54.3.3] FAIL');
  for (const msg of messages) console.error(`- ${msg}`);
  process.exit(1);
}

console.log('[verify-v54.3.3] OK');
console.log('- canonical DB history remains in supabase/migrations/');
console.log('- legacy release history archived internally');
console.log('- root package/release flow streamlined for v54.3.3');
