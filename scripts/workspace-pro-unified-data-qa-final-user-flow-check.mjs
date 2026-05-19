import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const version = read('src/lib/release/version.ts');
const taskStatus = read('src/lib/constants/task-status.ts');
const statusHelpers = read('src/lib/tasks/status.ts');
const taskTypes = read('src/types/task.ts');
const workspaceHome = read('src/components/workspace/workspace-home.tsx');
const classicBoard = read('src/components/tasks/task-kanban-board.tsx');
const workspacePro = read('src/components/workspace-pro/workspace-pro-page.tsx');
const quickCreate = read('src/components/workspace-system/workspace-quick-create.tsx');
const inlineActions = read('src/components/workspace-system/workspace-task-inline-actions.tsx');
const projectInline = read('src/components/projects/project-inline-tasks.tsx');
const mutations = read('src/lib/tasks/task-mutations.ts');
const failures = [];
const allowedSlugs = [
  '58.28.17.1-unified-data-qa-inline-status-type-hotfix',
  '58.28.19-ux-copy-empty-states-final',
  '58.28.20-mobile-responsive-final-pass',
  '58.28.21-supabase-rls-client-readiness-final',
  '58.28.21.2-classic-project-edit-form-alignment',
];
const statuses = ['pendiente', 'en_proceso', 'produccion', 'en_espera', 'revision', 'concluido'];

if (!allowedSlugs.includes(pkg.version)) failures.push('package.json must use an allowed v58.28.17+ slug');
if (!['npm run verify:v58.28.17.1', 'npm run verify:v58.28.19', 'npm run verify:v58.28.20', 'npm run verify:v58.28.21', 'npm run verify:v58.28.21.2'].includes(pkg.scripts?.['verify:current'])) failures.push('verify:current must target the active v58.28.17+ verify script');
if (!allowedSlugs.some((slug) => version.includes(slug))) failures.push('release version must contain an allowed v58.28.17+ slug');
for (const status of statuses) {
  for (const [name, source] of Object.entries({ taskStatus, statusHelpers, taskTypes, workspaceHome, classicBoard, workspacePro, projectInline })) {
    if (!source.includes(status)) failures.push(`${name} must include status ${status}`);
  }
  if (!quickCreate.includes(status) && status !== 'concluido') failures.push(`quickCreate must include status ${status}`);
  if (!inlineActions.includes(status) && !inlineActions.includes('TASK_STATUSES')) failures.push(`inlineActions must include status ${status} or shared TASK_STATUSES`);
}
for (const source of [taskStatus, statusHelpers, workspaceHome, workspacePro, quickCreate, projectInline]) {
  if (!source.includes('En curso')) failures.push('All task status UIs must use visible label En curso');
}
if (!inlineActions.includes('En curso') && !inlineActions.includes('TASK_STATUSES')) failures.push('Inline actions must use En curso directly or shared TASK_STATUSES');
if (workspaceHome.includes('label: \'Hecho\'') || workspaceHome.includes('<option value="concluido">Hecho</option>')) failures.push('Classic workspace must not show Hecho for task status');
if (workspacePro.includes('label: "En proceso"') || quickCreate.includes('>En proceso<') || inlineActions.includes('label: "En proceso"') || projectInline.includes('En proceso')) failures.push('Pro/workspace/project task surfaces must not show En proceso for task status');
if (!workspacePro.includes('syncedTasks') || !workspacePro.includes('subscribeTaskUpdated')) failures.push('Workspace Pro must keep syncedTasks from task-updated events');
if (!workspaceHome.includes('subscribeTaskUpdated') || !workspaceHome.includes('mergeTaskUpdate')) failures.push('Classic workspace home must listen for task-updated events');
if (!mutations.includes('FLOWTASK_TASK_UPDATED_EVENT') || !mutations.includes('due_date')) failures.push('Task mutation helper must emit task updates with due date payload');
if (!fs.existsSync('docs/qa/FLOWTASK_V58_28_17_CLASSIC_PRO_UNIFIED_DATA_QA.md')) failures.push('Missing v58.28.17 QA checklist');

if (failures.length) {
  console.error('[workspace:unified-data-qa:ready] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[workspace:unified-data-qa:ready] OK — Classic and Pro data labels, sync hooks and QA flow aligned.');
