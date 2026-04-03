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
  'docs/release/V55_HARDENING_CHECKLIST.md',
  'docs/release/V55_DELIVERY_NOTES.md',
  'docs/release/V56_UX_FINAL_CHECKLIST.md',
  'docs/release/V56_DELIVERY_NOTES.md',
  'docs/release/V57_PLATFORM_CONTROL_CHECKLIST.md',
  'docs/release/V57_DELIVERY_NOTES.md',
  'src/app/(app)/app/platform/page.tsx',
  'src/components/admin/admin-errors-panel.tsx',
  'src/components/admin/admin-usage-panel.tsx',
  'src/components/admin/admin-platform-pulse.tsx',
  'src/lib/queries/admin.ts',
  'src/types/admin.ts',
  '.env.example',
  '.gitignore',
  'README.md',
  'scripts/security-check.mjs',
  'scripts/release-check.mjs',
];
const forbiddenAtRoot = ['node_modules', '.next', '.git', '.env', '.env.local', '__MACOSX', '.DS_Store', 'RT_modulos', 'tsconfig.tsbuildinfo'];
const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
const forbidden = forbiddenAtRoot.filter((name) => fs.existsSync(path.join(root, name)));
if (missing.length || forbidden.length) {
  console.error('[verify-v57] Repo verification failed.');
  if (missing.length) console.error('Missing required paths:', missing.join(', '));
  if (forbidden.length) console.error('Forbidden root items detected:', forbidden.join(', '));
  process.exit(1);
}
console.log('[verify-v57] OK — platform control integrado, observabilidad visible y base lista para handoff final.');
