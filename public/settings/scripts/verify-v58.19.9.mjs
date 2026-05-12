#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
function read(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}
function mustInclude(file, marker, label = marker) {
  const text = read(file);
  if (!text.includes(marker)) failures.push(`${file} must include ${label}`);
}
function mustMatch(file, regex, label = String(regex)) {
  const text = read(file);
  if (!regex.test(text)) failures.push(`${file} must match ${label}`);
}
function mustNotInclude(file, marker, label = marker) {
  const text = read(file);
  if (text.includes(marker)) failures.push(`${file} must not include ${label}`);
}
function mustNotExist(path) {
  if (fs.existsSync(path)) failures.push(`${path} must not exist in release package`);
}

mustInclude('package.json', '"version": "58.19.9-supabase-live-qa-vercel-verify-fix"', 'v58.19.8 package version');
mustInclude('package.json', '"verify:current": "npm run verify:v58.19.9"', 'current verifier target');
mustInclude('package.json', '"verify:v58.19.9": "node scripts/verify-v58.19.9.mjs"', 'v58.19.8 verifier script');
mustInclude('package-lock.json', '"version": "58.19.9-supabase-live-qa-vercel-verify-fix"', 'lockfile version');
mustInclude('src/lib/release/version.ts', '58.19.9-supabase-live-qa-vercel-verify-fix', 'runtime version');
mustInclude('src/lib/release/version.ts', 'v58.19.9 Supabase Live QA + Vercel Verify Fix', 'runtime release name');
mustInclude('src/lib/release/version.ts', 'production-candidate', 'runtime release stage');
mustInclude('README.md', 'v58.19.9 Supabase Live QA + Vercel Verify Fix', 'README release title');

mustMatch('scripts/ops-check.mjs', /eventName:\\s\*\[\'\"\]login\[\'\"\]/, 'ops check accepts single/double quoted login marker');
mustNotInclude('scripts/release-check.mjs', 'archive/internal/README.md', 'legacy archive requirement');
mustNotInclude('scripts/release-check.mjs', "archive/internal/legacy_release_history/RT_modulos');", 'legacy SQL archive requirement');
mustInclude('scripts/build-deploy-readiness.mjs', '58.19.9-supabase-live-qa-vercel-verify-fix', 'deploy readiness current version');
mustInclude('scripts/build-deploy-readiness.mjs', 'verify:v58.19.9', 'deploy readiness current verifier');

mustInclude('src/lib/share/analytics-share.ts', 'function buildXlsx(payload: SharedAnalyticsPayload)', 'dependency-free XLSX builder');
mustInclude('src/lib/share/analytics-share.ts', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'XLSX MIME type');
mustInclude('src/lib/share/analytics-share.ts', "name: 'Reporte'", 'Reporte worksheet');
mustInclude('src/lib/share/analytics-share.ts', "name: 'Tareas exportadas'", 'Tareas worksheet');
mustInclude('src/lib/share/analytics-share.ts', "name: 'Resumen'", 'Resumen worksheet');
mustInclude('src/lib/share/analytics-share.ts', "name: 'Diccionario'", 'Diccionario worksheet');
mustNotInclude('package.json', 'exceljs', 'exceljs dependency');
mustNotInclude('package-lock.json', 'exceljs', 'exceljs lock dependency');

mustInclude('src/components/shared/shared-analytics-landing.tsx', 'max-w-[1180px]', 'centered public landing width');
mustInclude('src/components/shared/shared-analytics-landing.tsx', 'Exportar reporte', 'bottom export action');
mustNotInclude('src/components/shared/shared-analytics-landing.tsx', 'Resumen del reporte', 'removed summary side panel');
mustNotInclude('src/components/shared/shared-analytics-landing.tsx', 'lg:grid-cols-[minmax(0,1fr)_320px]', 'removed two-column side panel');

mustInclude('src/lib/security/organization-access.ts', 'PERSONAL_WORKSPACE_VALUE', 'personal workspace cookie support');
mustInclude('src/lib/security/organization-access.ts', 'Do not auto-promote the first/default organization as active workspace.', 'explicit organization selection guard');
mustInclude('src/lib/queries/workspace.ts', 'return query.eq("owner_id", userId).is("organization_id", null);', 'personal scope isolation');
mustInclude('src/lib/queries/workspace.ts', 'return query.eq("organization_id", organizationId);', 'organization scope isolation');
mustInclude('src/app/api/workspace/active/route.ts', 'PERSONAL_WORKSPACE_VALUE', 'workspace reset to personal');
mustInclude('src/app/api/organization/manage/route.ts', 'purge_scheduled_at', 'soft delete/reactivation window');
mustInclude('src/app/api/cron/organization-purge/route.ts', 'purgeExpiredOrganizations', 'scheduled purge job');

mustInclude('docs/releases/RELEASE_NOTES_v58.19.9.md', 'Supabase Live QA', 'release notes');
mustInclude('docs/qa/FLOWTASK_V58.19.9_SUPABASE_LIVE_QA_SMOKE.md', 'Aislamiento personal ↔ organización', 'manual workspace smoke checklist');
mustInclude('docs/qa/FLOWTASK_V58.19.9_SUPABASE_LIVE_QA_SMOKE.md', 'doctor:supabase', 'Supabase live smoke command');

// Local/Vercel builds legitimately contain .env files, node_modules and sometimes .next.
// Keep those checks only for a dedicated ZIP/package audit:
// FLOWTASK_VERIFY_RELEASE_PACKAGE=1 npm run verify:v58.19.9
if (process.env.FLOWTASK_VERIFY_RELEASE_PACKAGE === '1') {
  mustNotExist('.env');
  mustNotExist('.env.local');
  mustNotExist('node_modules');
  mustNotExist('.next');
}

if (failures.length) {
  console.error('[verify:v58.19.9] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.19.9] OK — Supabase Live QA + Vercel Verify Fix aligned: metadata, release checks, XLSX, landing, personal/org isolation and Supabase smoke docs. Build-safe verifier skips local/Vercel generated folders by default.');
