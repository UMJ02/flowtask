import { existsSync } from 'node:fs';

const required = [
  'src/app/api/organization/invites/route.ts',
  'src/app/api/organization/invites/accept/route.ts',
  'src/app/api/organization/members/update-role/route.ts',
  'src/components/organization/organization-pending-invites-card.tsx',
  'supabase/migrations/0029_v58_1_organization_access_completion.sql',
  'src/lib/release/version.ts',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('[verify-v58.1] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('[verify-v58.1] OK');
