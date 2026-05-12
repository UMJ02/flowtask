import fs from 'node:fs';

const checks = [
  ['package version', 'package.json', '58.16-project-task-architecture'],
  ['release version', 'src/lib/release/version.ts', 'v58.16 Project Task Architecture'],
  ['tasks query isolates standalone tasks', 'src/lib/queries/tasks.ts', 'query = query.is("project_id", null);'],
  ['task editor hides manual project selector', 'src/components/tasks/task-form.tsx', 'Tarea de proyecto'],
  ['project conversion creates child tasks', 'src/components/projects/project-form.tsx', 'task_checklist_items'],
  ['project progress uses child tasks', 'src/lib/queries/projects.ts', 'taskProgressByProject'],
];

for (const [label, file, needle] of checks) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(needle)) {
    console.error('[verify:v58.16] Missing ' + label + ': ' + needle);
    process.exit(1);
  }
}

console.log('[verify:v58.16] OK — Project Task Architecture aligned.');
