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
function mustNotInclude(file, marker, label = marker) {
  const text = read(file);
  if (text.includes(marker)) failures.push(`${file} must not include ${label}`);
}
function mustMatch(file, regex, label = String(regex)) {
  const text = read(file);
  if (!regex.test(text)) failures.push(`${file} must match ${label}`);
}
function mustNotExist(path) {
  if (fs.existsSync(path)) failures.push(`${path} must not exist in release package`);
}

mustInclude('package.json', '"version": "58.20-task-workspace-pro"', 'v58.20 package version');
mustInclude('package.json', '"verify:current": "npm run verify:v58.20"', 'current verifier target');
mustInclude('package.json', '"verify:v58.20": "node scripts/verify-v58.20.mjs"', 'v58.20 verifier script');
mustInclude('package-lock.json', '"version": "58.20-task-workspace-pro"', 'lockfile version');
mustInclude('src/lib/release/version.ts', '58.20-task-workspace-pro', 'runtime version');
mustInclude('src/lib/release/version.ts', 'v58.20 Task Workspace Pro', 'runtime release name');
mustInclude('src/lib/release/version.ts', 'production-candidate', 'runtime release stage');
mustInclude('README.md', 'v58.20 Task Workspace Pro', 'README release title');

mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'Task Workspace Pro', 'Task Workspace Pro sticky context');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'grid max-w-[1440px] grid-cols-1 gap-6', 'premium workspace grid');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'lg:grid-cols-[minmax(0,1fr)_360px]', '70/30 content + sticky sidebar layout');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'Contexto operativo', 'smart sidebar context panel');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'Actividad de la tarea', 'human activity timeline');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'Agregá el checklist para que el progreso inicie correctamente desde 0%', 'zero-progress checklist reminder');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', "task.status === 'concluido' ? 100 : 0", 'no checklist progress starts at 0');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx', 'Modo lectura activo', 'readonly UX state');
mustInclude('src/components/tasks/task-form.tsx', 'statusProgress = checklistStats.total > 0', 'create/edit checklist progress uses real checklist');
mustInclude('src/components/tasks/task-form.tsx', 'sin checklist, inicia en 0%', 'edit reminder copy');

mustInclude('src/lib/share/analytics-share.ts', 'function buildXlsx(payload: SharedAnalyticsPayload)', 'dependency-free XLSX builder still present');
mustNotInclude('package.json', 'exceljs', 'exceljs dependency');
mustNotInclude('package-lock.json', 'exceljs', 'exceljs lock dependency');
mustInclude('src/components/shared/shared-analytics-landing.tsx', 'max-w-[1180px]', 'centered public landing still present');
mustNotInclude('src/components/shared/shared-analytics-landing.tsx', 'Resumen del reporte', 'removed summary side panel still absent');

mustInclude('scripts/ops-check.mjs', 'login', 'ops check keeps login telemetry coverage');
mustInclude('scripts/build-deploy-readiness.mjs', '58.20-task-workspace-pro', 'deploy readiness current version');
mustInclude('scripts/build-deploy-readiness.mjs', 'verify:v58.20', 'deploy readiness current verifier');
mustInclude('scripts/release-check.mjs', 'scripts/verify-v58.20.mjs', 'release check v58.20 verifier');
mustInclude('docs/releases/RELEASE_NOTES_v58.20.md', 'Task Workspace Pro', 'release notes');
mustInclude('docs/qa/FLOWTASK_V58.20_TASK_WORKSPACE_PRO_SMOKE.md', 'Task Workspace Pro', 'manual task workspace smoke checklist');
mustInclude('docs/qa/FLOWTASK_V58.20_TASK_WORKSPACE_PRO_SMOKE.md', 'Aislamiento personal ↔ organización', 'workspace isolation still required');

if (process.env.FLOWTASK_VERIFY_RELEASE_PACKAGE === '1') {
  mustNotExist('.env');
  mustNotExist('.env.local');
  mustNotExist('node_modules');
  mustNotExist('.next');
}

if (failures.length) {
  console.error('[verify:v58.20] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.20] OK — Task Workspace Pro aligned: task detail workspace, sticky bar, smart sidebar, checklist-first progress, human activity, Vercel-safe verification, XLSX/landing preserved and personal/org QA documented.');
