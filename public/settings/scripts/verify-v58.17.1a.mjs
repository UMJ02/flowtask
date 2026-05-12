import fs from 'node:fs';

const checks = [
  ['package.json', '58.17.1a-supabase-migration-hotfix'],
  ['package.json', 'verify:v58.17.1a'],
  ['src/lib/release/version.ts', 'v58.17.1a Account Model & Supabase Migration Hotfix'],
  ['src/lib/account-model.ts', 'individual_user'],
  ['src/lib/account-model.ts', 'organizationIsNotAUser'],
  ['src/lib/security/organization-access.ts', 'Do not auto-promote the first/default organization'],
  ['src/lib/queries/organization.ts', 'preference && preference !== PERSONAL_WORKSPACE_VALUE'],
  ['src/lib/queries/onboarding.ts', 'Tu espacio personal está listo'],
  ['src/lib/queries/onboarding.ts', 'workspaceMode'],
  ['supabase/migrations/0042_v58_17_1a_account_model_supabase_hotfix.sql', 'bootstrap_organization_workspace'],
  ['supabase/migrations/0042_v58_17_1a_account_model_supabase_hotfix.sql', 'No destructive data changes'],
];

const forbidden = [
  ['src/lib/security/organization-access.ts', 'fallbackMembership'],
  ['src/lib/queries/organization.ts', 'defaultOrganization'],
  ['src/lib/queries/onboarding.ts', 'Define organización activa'],
  ['src/lib/queries/onboarding.ts', 'Activa o crea una organización antes de seguir'],
];

const missing = checks.filter(([file, needle]) => !fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(needle));
const presentForbidden = forbidden.filter(([file, needle]) => fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(needle));

if (missing.length || presentForbidden.length) {
  if (missing.length) {
    console.error('[verify:v58.17.1a] Missing expected content:');
    for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  }
  if (presentForbidden.length) {
    console.error('[verify:v58.17.1a] Forbidden legacy content found:');
    for (const [file, needle] of presentForbidden) console.error(`- ${file}: ${needle}`);
  }
  process.exit(1);
}

console.log('[verify:v58.17.1a] OK — account model is personal-first, org activation is explicit, and Supabase hotfix SQL is bundled.');
