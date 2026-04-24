import fs from 'node:fs';

const required = [
  'supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql',
  'src/lib/supabase/workspace-client.ts',
  'src/lib/queries/departments.ts',
  'src/components/clients/client-manager-panel.tsx',
  'src/components/tasks/task-form.tsx',
  'src/components/projects/project-form.tsx',
  'src/app/api/organization/manage/route.ts',
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify:v58.12.6] Missing files:', missing.join(', '));
  process.exit(1);
}

const migration = fs.readFileSync('supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql', 'utf8');
const migrationChecks = [
  'purge_after',
  'reactivated_at',
  'delete_workspace_client',
  'enrich_activity_log_row',
  'countries_scope_name_unique',
  'departments_scope_name_unique',
  'clients_scope_name_unique',
  'projects_select_workspace_access',
  'tasks_select_workspace_access',
];
for (const check of migrationChecks) {
  if (!migration.includes(check)) {
    console.error('[verify:v58.12.6] Missing migration marker:', check);
    process.exit(1);
  }
}

const workspaceClient = fs.readFileSync('src/lib/supabase/workspace-client.ts', 'utf8');
for (const check of ['getCatalogScopeRank', 'dedupeCatalogByName', 'fetchWorkspaceDepartments', 'fetchWorkspaceCountries']) {
  if (!workspaceClient.includes(check)) {
    console.error('[verify:v58.12.6] Missing workspace catalog marker:', check);
    process.exit(1);
  }
}

const clientPanel = fs.readFileSync('src/components/clients/client-manager-panel.tsx', 'utf8');
if (!clientPanel.includes("rpc('delete_workspace_client'")) {
  console.error('[verify:v58.12.6] Client delete flow must use delete_workspace_client RPC.');
  process.exit(1);
}

console.log('[verify:v58.12.6] OK');
