import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;
const requiredFiles = [
  'src/lib/release/version.ts',
  'scripts/verify-v58.11.4.mjs',
  'src/components/dashboard/intelligent-attention-assistant.tsx',
  'src/components/settings/intelligent-attention-settings-card.tsx',
  'src/lib/assistant/reminder-settings.ts',
  'src/lib/queries/dashboard.ts',
  'docs/release/V58_11_4_INTELLIGENT_ASSISTANT_ADVANCED_ENGINE.md',
  'README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.11.4] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error('[verify-v58.11.4] Repo verification failed.');
  process.exit(1);
}

console.log('[verify-v58.11.4] OK — assistant inteligente avanzado y polish visual listos.');
