import fs from 'node:fs';

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const pkg = JSON.parse(read('package.json'));
const page = read('src/components/workspace-pro/workspace-pro-page.tsx');
const css = read('src/app/globals.css');

if (!String(pkg.version ?? '').startsWith('58.27.')) failures.push(`Unexpected package version: ${pkg.version}`);
if (!String(pkg.scripts?.['verify:current'] ?? '').includes('verify:v58.27.')) failures.push('verify:current must target a v58.27 verify script');
if (!pkg.scripts?.['build:preflight']?.includes('workspace:deep-cleanup:ready')) failures.push('build:preflight must include workspace:deep-cleanup:ready');
if (!page.includes('WorkspaceProFilterBar')) failures.push('WorkspaceProFilterBar missing');
if (!page.includes('WorkspaceProControlSelect')) failures.push('WorkspaceProControlSelect missing');
if (!page.includes('commandCenterOpen ?')) failures.push('Command Center must be mounted only when open');
if (!page.includes('sharePanelOpen ?')) failures.push('Share Panel must be mounted only when open');
if (page.includes('<WorkspaceProRightPanel tasks={tasks} projects={projects} files={files} activity={activity} boards={boards} members={members} notifications={notifications} progress={progress} important={important} overdue={overdue} today={today} />\n          <WorkspaceProRightPanel')) failures.push('Duplicate right panel render still present');
const headerCount = (page.match(/Tarea<\/span><span>Estado<\/span><span>Prioridad/g) || []).length;
if (headerCount > 1) failures.push('Duplicate task list header detected');
if (!css.includes('v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System')) failures.push('CSS marker missing');
if (!css.includes('.ws-pro-filter-bar')) failures.push('Filter bar CSS missing');
if (!css.includes('.ws-pro-control-select')) failures.push('Control select CSS missing');

if (failures.length) {
  console.error('[workspace:deep-cleanup:ready] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[workspace:deep-cleanup:ready] OK — Workspace Pro deep cleanup and 2026 UI controls system aligned.');
