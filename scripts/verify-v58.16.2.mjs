import fs from 'node:fs';

const checks = [
  ['package.json', '58.16.2-ver-proyecto-premium-2026'],
  ['src/lib/release/version.ts', 'v58.16.2 Ver Proyecto Premium 2026'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectHeroCard'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectStatsRow'],
  ['src/components/projects/project-detail-pro.tsx', 'AvatarStack'],
  ['src/components/projects/project-detail-pro.tsx', 'projectActivityLabels'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectInlineTasks'],
  ['src/components/projects/project-planning-timeline.tsx', 'Project Smart Timeline'],
  ['src/components/projects/project-planning-timeline.tsx', 'xl:grid-cols-[minmax(0,1fr)_320px]'],
  ['src/components/projects/project-planning-timeline.tsx', 'Builder'],
];

const missing = checks.filter(([file, needle]) => !fs.readFileSync(file, 'utf8').includes(needle));
if (missing.length) {
  console.error('[verify:v58.16.2] Missing expected content:');
  for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  process.exit(1);
}

console.log('[verify:v58.16.2] OK — Ver Proyecto Premium 2026 applied with inline project tasks and contained builder.');
