import fs from 'node:fs';

const checks = [
  ['package version', 'package.json', '58.16.1-project-detail-tasks-inline'],
  ['release version', 'src/lib/release/version.ts', 'v58.16.1 Project Detail Tasks Inline Architecture'],
  ['tasks query isolates standalone tasks', 'src/lib/queries/tasks.ts', 'query = query.is("project_id", null);'],
  ['task editor hides manual project selector', 'src/components/tasks/task-form.tsx', 'Tarea de proyecto'],
  ['project conversion creates child tasks', 'src/components/projects/project-form.tsx', 'task_checklist_items'],
  ['project progress uses child tasks', 'src/lib/queries/projects.ts', 'taskProgressByProject'],
  ['inline project tasks component', 'src/components/projects/project-inline-tasks.tsx', 'ProjectInlineTasks'],
  ['project task actions stay inline', 'src/components/projects/project-detail-pro.tsx', 'Ir a tareas internas']
];

for (const [label, file, needle] of checks) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(needle)) {
    console.error('[verify:v58.16.1] Missing ' + label + ': ' + needle);
    process.exit(1);
  }
}

console.log('[verify:v58.16.1] OK — Project Detail Tasks Inline Architecture aligned.');
