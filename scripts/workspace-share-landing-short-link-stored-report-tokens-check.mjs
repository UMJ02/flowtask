import fs from 'node:fs';

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const pkg = JSON.parse(read('package.json') || '{}');
const migration = read('supabase/migrations/0061_v58_28_21_4_shared_report_tokens.sql');
const api = read('src/app/api/share/reports/route.ts');
const query = read('src/lib/queries/shared-reports.ts');
const card = read('src/components/analytics/share-center-card.tsx');
const share = read('src/lib/share/analytics-share.ts');
const landing = read('src/components/shared/shared-analytics-landing.tsx');
const failures = [];

if (!['58.28.21.4-share-landing-short-link-stored-report-tokens', '58.28.21.5-radar-analytics-due-state-integrity'].includes(pkg.version)) failures.push('unexpected package version');
if (!pkg.scripts?.['build:preflight']?.includes('workspace:share-shortlink:ready')) failures.push('preflight must run shortlink readiness check');
for (const marker of ['shared_reports', 'token text not null unique', 'payload jsonb not null', 'enable row level security']) {
  if (!migration.includes(marker)) failures.push(`shared_reports migration missing: ${marker}`);
}
for (const marker of ['randomBytes', 'rpt_', 'supabase.auth.getUser', 'expiresAt', 'shared_reports']) {
  if (!api.includes(marker)) failures.push(`shortlink API missing: ${marker}`);
}
for (const marker of ['getStoredSharedAnalyticsPayload', 'shared_reports', 'maybeSingle']) {
  if (!query.includes(marker)) failures.push(`stored payload query missing: ${marker}`);
}
for (const marker of ['createStoredAnalyticsShare', 'Copiar link corto', 'Link corto copiado', 'buildLegacyAnalyticsShareUrl']) {
  if (!card.includes(marker) && !share.includes(marker)) failures.push(`share center missing: ${marker}`);
}
if (!landing.includes('storedPayload ?? decodeAnalyticsShareToken')) failures.push('landing must support stored payload with legacy data fallback');

if (failures.length) {
  console.error('[workspace:share-shortlink:ready] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[workspace:share-shortlink:ready] OK — stored report tokens, short links and legacy share fallback aligned.');
