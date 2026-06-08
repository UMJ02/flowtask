import { readFileSync, existsSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const versionText = readFileSync('src/lib/release/version.ts', 'utf8');
const share = readFileSync('src/lib/share/analytics-share.ts', 'utf8');
const shareCard = readFileSync('src/components/analytics/share-center-card.tsx', 'utf8');
const landing = readFileSync('src/components/shared/shared-analytics-landing.tsx', 'utf8');
const tokenPage = readFileSync('src/app/(public)/share/[token]/page.tsx', 'utf8');
const apiRoute = readFileSync('src/app/api/share/reports/route.ts', 'utf8');
const migration = readFileSync('supabase/migrations/0061_v58_28_21_4_shared_report_tokens.sql', 'utf8');
const failures = [];
const expectedVersion = '58.28.21.4-share-landing-short-link-stored-report-tokens',
  '58.28.21.5-radar-analytics-due-state-integrity',
  '58.28.21.6-data-integrity-live-sync-audit';

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.28.21.4', 'npm run verify:v58.28.21.5',
  'npm run verify:v58.28.21.6') failures.push('verify:current must target verify:v58.28.21.4');
if (!pkg.scripts?.['build:preflight']?.includes('workspace:share-shortlink:ready')) failures.push('build:preflight must include workspace:share-shortlink:ready');
if (!versionText.includes(expectedVersion)) failures.push('version.ts must contain v58.28.21.4 slug');
if (!versionText.includes('APP_RELEASE_STAGE')) failures.push('version.ts must export APP_RELEASE_STAGE');
for (const marker of ['createStoredAnalyticsShare', 'buildLegacyAnalyticsShareUrl', '/api/share/reports']) {
  if (!share.includes(marker) && !shareCard.includes(marker)) failures.push(`short link client missing marker: ${marker}`);
}
for (const marker of ['shared_reports', 'generateReportToken', 'expires_at', 'rpt_']) {
  if (!apiRoute.includes(marker)) failures.push(`API route missing marker: ${marker}`);
}
for (const marker of ['getStoredSharedAnalyticsPayload', 'payload={payload}', 'decodeAnalyticsShareToken']) {
  if (!tokenPage.includes(marker) && !landing.includes(marker)) failures.push(`stored landing fallback missing marker: ${marker}`);
}
for (const marker of ['create table if not exists public.shared_reports', 'shared_reports_public_select_active', 'shared_reports_insert_owner', 'token text not null unique']) {
  if (!migration.includes(marker)) failures.push(`migration missing marker: ${marker}`);
}
if (!existsSync('docs/qa/FLOWTASK_V58_28_21_4_SHARE_LANDING_SHORT_LINK_QA.md')) failures.push('missing QA doc for short share links');
if (!existsSync('docs/sql/V58_28_21_4_SHARED_REPORT_TOKENS.sql')) failures.push('missing SQL validation doc for shared report tokens');

if (failures.length) {
  console.error('[verify:v58.28.21.4] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.28.21.4] OK — Share landing short links and stored report tokens aligned.');
