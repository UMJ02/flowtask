import fs from 'node:fs';
const required = [
  'src/app/api/organization/bootstrap/route.ts',
  'src/components/organization/organization-bootstrap-card.tsx',
  'src/lib/organization/labels.ts',
  'supabase/migrations/0028_v58_organization_bootstrap_and_personal_consistency.sql',
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v58.0] Missing files:', missing.join(', '));
  process.exit(1);
}
console.log('[verify-v58.0] OK');
