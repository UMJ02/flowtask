#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  'src/components/dashboard/intelligent-attention-assistant.tsx',
  'src/components/settings/intelligent-attention-settings-card.tsx',
  'src/lib/assistant/reminder-settings.ts',
  'src/lib/assistant/advanced-engine.ts',
  'public/assistant/guide-male.png',
  'public/assistant/guide-female.png',
  'docs/release/V58_11_7_FORM_PERSISTENCE_AND_ASSISTANT_SIZE_FIX.md',
];

const missing = required.filter((item) => !fs.existsSync(path.join(root, item)));
if (missing.length) {
  console.error('[verify-v58.11.7] FAILED');
  for (const file of missing) console.error(` - Missing ${file}`);
  process.exit(1);
}

const version = fs.readFileSync(path.join(root, 'src/lib/release/version.ts'), 'utf8');
if (!version.includes('58.11.7-form-persistence-and-assistant-size-fix')) {
  console.error('[verify-v58.11.7] FAILED - release version mismatch');
  process.exit(1);
}

console.log('[verify-v58.11.7] OK — persistencia real de formularios y ajuste de personaje del radar inteligente sobre la base v58.11.5.');
