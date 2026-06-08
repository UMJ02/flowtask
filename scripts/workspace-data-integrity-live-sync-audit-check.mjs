import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}
function assertIncludes(file, needle, message) {
  const body = read(file);
  if (!body.includes(needle)) throw new Error(`${message} (${file})`);
}
function assertNotIncludes(file, needle, message) {
  const body = read(file);
  if (body.includes(needle)) throw new Error(`${message} (${file})`);
}

assertIncludes('src/lib/tasks/status.ts', 'TASK_DUE_ELIGIBLE_STATUSES', 'Task due eligibility must be centralized');
assertIncludes('src/lib/tasks/status.ts', 'TASK_STANDBY_STATUSES', 'Standby statuses must be centralized');
assertIncludes('src/lib/tasks/status.ts', 'TASK_STATUS.REVIEW', 'Review status must be modeled');
assertIncludes('src/lib/queries/tasks.ts', '.is("deleted_at", null)', 'Main task query must hide soft-deleted rows');
assertIncludes('src/lib/queries/tasks.ts', '.not("status", "in", \'(concluido,en_espera,revision)\')', 'Task due filters must exclude completed, waiting and review');
assertIncludes('src/lib/queries/reports.ts', 'isTaskDueEligible', 'Reports must use centralized due eligibility');
assertIncludes('src/lib/queries/reports.ts', 'isTaskStandby', 'Reports must separate waiting/review as standby');
assertNotIncludes('src/lib/queries/reports.ts', 'task.status !== "en_espera"', 'Reports must not treat review as operational by excluding only en_espera');
assertIncludes('src/lib/queries/analytics.ts', 'isTaskDueEligible', 'Analytics must use centralized due eligibility');
assertIncludes('src/lib/queries/analytics.ts', 'isTaskStandby', 'Analytics must separate waiting/review as standby');
assertNotIncludes('src/lib/queries/analytics.ts', 'task.status !== TASK_STATUS.WAITING', 'Analytics must not treat review as operational by excluding only waiting');
assertIncludes('src/lib/queries/analytics.ts', 'getLatestCommentsByTaskIds', 'Analytics share payload must read latest comments from comments table');
assertIncludes('src/lib/queries/analytics.ts', '.from("comments")', 'Analytics must read report comments from public.comments');
assertIncludes('src/lib/queries/dashboard.ts', '.is("deleted_at", null)', 'Dashboard direct task queries must hide soft-deleted rows');
assertIncludes('src/lib/queries/dashboard.ts', '.in("status", ["en_espera", "revision"])', 'Dashboard waiting block must include review');
assertIncludes('src/components/shared/shared-analytics-landing.tsx', 'Los datos se actualizan cuando se genera un nuevo enlace desde FlowTask', 'Shared landing must disclose snapshot behavior');
assertIncludes('src/app/api/share/reports/route.ts', '.from(\'shared_reports\')', 'Share API must persist stored report tokens');

console.log('Data integrity live sync audit OK');
