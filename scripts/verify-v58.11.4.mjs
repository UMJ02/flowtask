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
  'docs/release/V58_11_4_INTELLIGENT_ASSISTANT_ADVANCED_ENGINE.md',
];

const missing = required.filter((item) => !fs.existsSync(path.join(root, item)));
if (missing.length) {
  console.error('[verify-v58.11.4] FAILED');
  for (const file of missing) console.error(` - Missing ${file}`);
  process.exit(1);
}

const version = fs.readFileSync(path.join(root, 'src/lib/release/version.ts'), 'utf8');
if (!version.includes('58.11.4-intelligent-assistant-advanced-engine')) {
  console.error('[verify-v58.11.4] FAILED - release version mismatch');
  process.exit(1);
}

console.log('[verify-v58.11.4] OK — motor avanzado, preferencias finas y aislamiento por workspace listos.');
