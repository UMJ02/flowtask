import { readFileSync } from 'node:fs';

const files = {
  status: 'src/lib/tasks/status.ts',
  tasks: 'src/lib/queries/tasks.ts',
  dashboard: 'src/lib/queries/dashboard.ts',
  radar: 'src/lib/queries/risk-radar.ts',
  planning: 'src/lib/queries/planning.ts',
  control: 'src/lib/queries/control-tower.ts',
  home: 'src/components/workspace/workspace-home.tsx',
};

const source = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readFileSync(file, 'utf8')]));
const failures = [];

function expect(key, needle, message) {
  if (!source[key].includes(needle)) failures.push(`${files[key]}: ${message}`);
}

expect('status', 'TASK_DUE_ELIGIBLE_STATUSES = new Set<string>([TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.PRODUCTION])', 'due eligibility must be only pendiente/en_proceso/produccion');
expect('status', 'TASK_STANDBY_STATUSES = new Set<string>([TASK_STATUS.WAITING, TASK_STATUS.REVIEW])', 'standby statuses must include en_espera and revision');
expect('status', 'TASK_OVERDUE_EXCLUDED_STATUSES = new Set<string>([TASK_STATUS.DONE, TASK_STATUS.WAITING, TASK_STATUS.REVIEW])', 'overdue exclusions must include concluido/en_espera/revision');
expect('status', 'return isTaskDueEligible(status) && dueDate.slice(0, 10) < todayIsoDate();', 'isTaskOverdue must use centralized due eligibility');
expect('tasks', "'(concluido,en_espera,revision)'", 'task due filters must exclude revision too');
expect('dashboard', "'(concluido,en_espera,revision)'", 'dashboard due filters must exclude revision too');
expect('radar', 'standbyFollowupTasks', 'risk radar must separate standby follow-up from overdue');
expect('planning', 'dueManagedTasks', 'planning must separate due-managed tasks from standby tasks');
expect('control', 'dueManagedTasks', 'control tower must separate due-managed tasks from standby tasks');
expect('home', 'standbyFollowupTasks', 'workspace radar must show standby follow-up without counting overdue');

for (const [key, text] of Object.entries(source)) {
  if (text.includes("'(concluido,en_espera)'")) failures.push(`${files[key]}: stale filter still excludes only en_espera, not revision`);
}

if (failures.length) {
  console.error('Radar data integrity check failed:\n' + failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('Radar data integrity OK: overdue excludes concluido/en_espera/revision; standby follow-up is separate.');
