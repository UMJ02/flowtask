import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const checkpoints = [
  { label: 'Global styles', file: 'src/app/globals.css' },
  { label: 'App shell polish', file: 'src/components/layout/app-shell.tsx' },
  { label: 'Dashboard hero', file: 'src/components/dashboard/dashboard-hero.tsx' },
  { label: 'Task list hierarchy', file: 'src/components/tasks/task-list.tsx' },
  { label: 'Task detail summary', file: 'src/components/tasks/task-detail-summary.tsx' },
  { label: 'Project detail summary', file: 'src/components/projects/project-detail-summary.tsx' },
  { label: 'Empty state', file: 'src/components/ui/empty-state.tsx' },
];

let failures = 0;

console.log('\n[ux-review] Flowtask V7 client-ready pass\n');

for (const item of checkpoints) {
  const full = path.join(root, item.file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${item.label} -> ${item.file}`);
  if (!ok) failures += 1;
}

console.log('\n[ux-review] Manual review checklist');
console.log('1. Verificar jerarquía visual del dashboard');
console.log('2. Verificar legibilidad de cards y detalle');
console.log('3. Verificar botones primarios/secundarios');
console.log('4. Verificar empty states y spacing');
console.log('5. Verificar comportamiento en desktop y móvil');

if (failures > 0) {
  console.error(`\n[ux-review] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[ux-review] All UX review checkpoints passed.\n');
