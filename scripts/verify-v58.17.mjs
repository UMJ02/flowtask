import fs from 'node:fs';

const checks = [
  ['package.json', '58.17-core-consolidation-release'],
  ['package.json', 'verify:v58.17'],
  ['src/lib/release/version.ts', 'v58.17 Core Consolidation Release'],
  ['README.md', 'V58.17'],
  ['src/lib/queries/tasks.ts', 'query = query.is("project_id", null)'],
  ['src/app/(app)/app/tasks/new/page.tsx', "if (key === 'projectId') return []"],
  ['src/app/(app)/app/tasks/[id]/page.tsx', 'redirect(projectDetailRoute(task.project_id))'],
  ['src/app/(app)/app/tasks/[id]/edit/page.tsx', 'redirect(projectDetailRoute(task.project_id))'],
  ['src/components/projects/project-inline-tasks.tsx', 'project_id: project.id'],
  ['src/components/projects/project-inline-tasks.tsx', 'project_task_added'],
  ['src/components/projects/project-planning-timeline.tsx', 'timeline-full-width-when-builder-hidden'],
  ['src/components/projects/project-planning-timeline.tsx', 'showBuilder ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1"'],
  ['src/components/projects/project-detail-pro.tsx', 'projectActivityLabels'],
];

const missing = checks.filter(([file, needle]) => !fs.readFileSync(file, 'utf8').includes(needle));
if (missing.length) {
  console.error('[verify:v58.17] Missing expected content:');
  for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  process.exit(1);
}
console.log('[verify:v58.17] OK — Core consolidation keeps Tasks standalone, routes project tasks back to Project Center, and preserves internal project tasks/timeline architecture.');
