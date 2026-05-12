import fs from 'node:fs';

const checks = [
  ['NEXT_PUBLIC_SUPABASE_URL', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())],
  ['SUPABASE_SERVICE_ROLE_KEY', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())],
  ['CRON_SECRET', Boolean(process.env.CRON_SECRET?.trim())],
  ['RESEND_API_KEY', Boolean(process.env.RESEND_API_KEY?.trim())],
  ['INVITE_EMAIL_FROM or RESEND_FROM_EMAIL', Boolean(process.env.INVITE_EMAIL_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim())],
  ['NEXT_PUBLIC_APP_URL or FLOWTASK_BASE_URL', Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.FLOWTASK_BASE_URL?.trim())],
];

const files = [
  'src/app/api/cron/organization-purge/route.ts',
  'src/lib/organization/purge.ts',
  'src/lib/email/resend.ts',
  'scripts/process-organization-purges.ts',
  'vercel.json',
  'supabase/migrations/0035_v58_11_1_organization_soft_delete_and_reactivation.sql',
];

let ok = true;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`[qa-final-v58.11.2] Missing required file: ${file}`);
    ok = false;
  }
}

console.log('[qa-final-v58.11.2] Environment readiness:');
for (const [name, present] of checks) {
  console.log(` - ${name}: ${present ? 'OK' : 'MISSING'}`);
  if (!present) ok = false;
}

if (!ok) {
  console.error('[qa-final-v58.11.2] Final QA gate not satisfied.');
  process.exit(1);
}

console.log('[qa-final-v58.11.2] OK — entorno listo para purga automática, correo y QA final.');
