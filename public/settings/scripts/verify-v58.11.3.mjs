import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;
const requiredFiles = [
  'src/lib/release/version.ts',
  'scripts/verify-v58.11.3.mjs',
  'src/components/dashboard/intelligent-attention-assistant.tsx',
  'src/components/settings/intelligent-attention-settings-card.tsx',
  'src/lib/assistant/reminder-settings.ts',
  'public/assistant/guide-male.png',
  'public/assistant/guide-female.png',
  'docs/release/V58_11_3_INTELLIGENT_ATTENTION_ASSISTANT.md',
  'README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.11.3] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error('[verify-v58.11.3] Repo verification failed.');
  process.exit(1);
}

console.log('[verify-v58.11.3] OK — assistant inteligente y recordatorios visuales listos.');
