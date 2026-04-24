import fs from 'node:fs';
const required = ['supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql','src/lib/supabase/workspace-client.ts','src/lib/queries/departments.ts','src/components/clients/client-manager-panel.tsx','src/app/api/organization/manage/route.ts'];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error('[verify:v58.12.6] Missing files:', missing.join(', ')); process.exit(1); }
const migration = fs.readFileSync('supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql', 'utf8');
for (const check of ['delete_workspace_client','enrich_activity_log_row','countries_scope_name_unique','departments_scope_name_unique','clients_scope_name_unique','projects_select_workspace_access','tasks_select_workspace_access']) { if (!migration.includes(check)) { console.error('[verify:v58.12.6] Missing:', check); process.exit(1); } }
const workspaceClient = fs.readFileSync('src/lib/supabase/workspace-client.ts', 'utf8');
if (!workspaceClient.includes('scopeRank') || !workspaceClient.includes('dedupeWorkspaceCatalog')) { console.error('[verify:v58.12.6] Catalog helpers missing.'); process.exit(1); }
console.log('[verify:v58.12.6] OK');
