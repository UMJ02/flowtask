import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'supabase/migrations/0028_v57_5_access_onboarding_modernization.sql',
  'src/components/onboarding/account-mode-console.tsx',
  'src/lib/queries/account-access.ts',
  'src/app/api/account/select-mode/route.ts',
  'src/app/api/account/redeem-code/route.ts',
  'src/app/api/account/create-workspace/route.ts',
  'src/app/api/platform/activation-codes/route.ts',
  'src/components/admin/admin-activation-codes-panel.tsx',
  'docs/release/V57_5_DELIVERY_NOTES.md',
];

const missing = required.filter((file) => !existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`[verify-v57.5] Missing files\n${missing.join('\n')}`);
  process.exit(1);
}

console.log('[verify-v57.5] Access onboarding modernization structure OK');
