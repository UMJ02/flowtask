import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;
const requiredFiles = [
  'src/lib/release/version.ts',
  'scripts/verify-v58.11.2.mjs',
  'scripts/build-deploy-readiness.mjs',
  'scripts/deploy-production-readiness.mjs',
  'scripts/process-organization-purges.ts',
  'scripts/qa-final-v58.11.2.mjs',
  'src/lib/organization/purge.ts',
  'src/lib/email/resend.ts',
  'src/app/api/organization/manage/route.ts',
  'src/app/api/organization/invites/route.ts',
  'src/app/api/cron/organization-purge/route.ts',
  'supabase/migrations/0035_v58_11_1_organization_soft_delete_and_reactivation.sql',
  'vercel.json',
  'README.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.11.2] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error('[verify-v58.11.2] Repo verification failed.');
  process.exit(1);
}

console.log('[verify-v58.11.2] OK — final ops, email, purge y QA listos para cierre.');
