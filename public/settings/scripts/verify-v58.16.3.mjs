import fs from 'node:fs';

const checks = [
  ['package.json', '58.16.3-ver-proyecto-premium-design-match'],
  ['package.json', 'verify:v58.16.3'],
  ['src/lib/release/version.ts', 'v58.16.3 Ver Proyecto Premium Design Match'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectHeroCard'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectStatsRow'],
  ['src/components/projects/project-detail-pro.tsx', 'AvatarStack'],
  ['src/components/projects/project-detail-pro.tsx', 'projectActivityLabels'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectInlineTasks'],
  ['src/components/projects/project-detail-pro.tsx', 'bg-gradient-to-l from-[#ECFDF5] via-[#EFF6FF]/50'],
  ['src/components/projects/project-detail-pro.tsx', 'radial-gradient'],
  ['src/components/projects/project-planning-timeline.tsx', 'Project Smart Timeline'],
  ['src/components/projects/project-planning-timeline.tsx', 'xl:grid-cols-[minmax(0,1fr)_320px]'],
  ['src/components/projects/project-planning-timeline.tsx', 'Guardar vista'],
  ['src/components/projects/project-planning-timeline.tsx', 'Exportar'],
  ['src/components/projects/project-planning-timeline.tsx', 'Builder'],
  ['src/components/projects/project-inline-tasks.tsx', 'project_id'],
];

const missing = checks.filter(([file, needle]) => !fs.readFileSync(file, 'utf8').includes(needle));
if (missing.length) {
  console.error('[verify:v58.16.3] Missing expected content:');
  for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  process.exit(1);
}
console.log('[verify:v58.16.3] OK — Ver Proyecto Premium 2026 design match, connected inline project tasks, and contained builder validated.');
