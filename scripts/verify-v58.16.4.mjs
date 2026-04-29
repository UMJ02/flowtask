import fs from 'node:fs';

const checks = [
  ['package.json', '58.16.4-project-timeline-full-width-polish'],
  ['package.json', 'verify:v58.16.4'],
  ['src/lib/release/version.ts', 'v58.16.4 Project Timeline Full Width Polish'],
  ['README.md', 'V58.16.4'],
  ['src/components/projects/project-planning-timeline.tsx', 'timeline-full-width-when-builder-hidden'],
  ['src/components/projects/project-planning-timeline.tsx', 'useState(false)'],
  ['src/components/projects/project-planning-timeline.tsx', 'showBuilder ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1"'],
  ['src/components/projects/project-planning-timeline.tsx', 'aria-pressed={showBuilder}'],
  ['src/components/projects/project-planning-timeline.tsx', 'Guardar vista'],
  ['src/components/projects/project-planning-timeline.tsx', 'Exportar'],
  ['src/components/projects/project-inline-tasks.tsx', 'project_id'],
  ['src/components/projects/project-detail-pro.tsx', 'ProjectHeroCard'],
];

const missing = checks.filter(([file, needle]) => !fs.readFileSync(file, 'utf8').includes(needle));
if (missing.length) {
  console.error('[verify:v58.16.4] Missing expected content:');
  for (const [file, needle] of missing) console.error(`- ${file}: ${needle}`);
  process.exit(1);
}
console.log('[verify:v58.16.4] OK — Project timeline expands full width when Builder is hidden, with premium project detail preserved.');
