import fs from 'node:fs';
const failures=[];
function inc(f,n){if(!fs.existsSync(f)){failures.push(`Missing ${f}`);return} if(!fs.readFileSync(f,'utf8').includes(n)) failures.push(`${f} must include ${n}`)}
function absent(f){if(fs.existsSync(f)) failures.push(`${f} must not exist at project root`)}
inc('package.json','"version": "58.17-core-consolidation-release"');
inc('package.json','"verify:current": "npm run verify:v58.17"');
inc('src/lib/release/version.ts','58.17-core-consolidation-release');
inc('src/lib/account-model.ts','ACCOUNT_MODEL_VERSION = "v58.17.1b"');
inc('src/lib/account-model.ts','primaryIdentity: "individual_user"');
inc('src/lib/account-model.ts','requiresExplicitSelection: true');
inc('src/lib/supabase/workspace-client.ts','const activeOrganizationId = cookiePreference === PERSONAL_WORKSPACE_VALUE');
inc('src/lib/queries/onboarding.ts','const personalSteps: OnboardingStep[]');
inc('src/lib/queries/onboarding.ts','const organizationSteps: OnboardingStep[]');
inc('src/types/database.ts','tasks: Table<{');
inc('src/types/database.ts','country: string | null;');
inc('src/types/database.ts','task_checklist_items: Table<{');
inc('src/types/database.ts','done: boolean');
inc('supabase/migrations/0043_v58_17_1b_real_db_contract_fix.sql','flowtask_db_contract_v58171b_check');
absent('0042_v58_17_1a_account_model_supabase_hotfix.sql');
if(failures.length){console.error('[verify:v58.17.1b] Failed checks:'); for(const f of failures) console.error(`- ${f}`); process.exit(1)}
console.log('[verify:v58.17.1b] OK — DB contract, account model and Vercel-compatible release gate aligned.');
