import fs from 'node:fs';
const required = [
  'supabase/migrations/0029_v57_6_subscription_capacity_controls.sql',
  'supabase/migrations/0030_v57_7_billing_commercial_lifecycle.sql',
  'src/app/api/organization/billing/manage/route.ts',
  'src/components/organization/organization-subscription-lifecycle-panel.tsx',
  'src/lib/release/version.ts'
];
const missing = required.filter((item) => !fs.existsSync(item));
if (missing.length) {
  console.error('[verify-v57.7] Missing files:', missing.join(', '));
  process.exit(1);
}
console.log('[verify-v57.7] OK');
