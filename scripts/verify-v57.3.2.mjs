import fs from 'fs';

const required = [
  'src/components/settings/settings-account-overview.tsx',
  'src/lib/release/version.ts',
  'docs/release/V57_3_2_DELIVERY_NOTES.md',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v57.3.2] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const overview = fs.readFileSync('src/components/settings/settings-account-overview.tsx', 'utf8');
const release = fs.readFileSync('src/lib/release/version.ts', 'utf8');

if (!overview.includes('grid grid-cols-2 gap-3 lg:grid-cols-4')) {
  console.error('[verify-v57.3.2] Mobile 2-column metrics grid is missing.');
  process.exit(1);
}

if (!overview.includes('text-[clamp(1.9rem,3.4vw,2.8rem)]')) {
  console.error('[verify-v57.3.2] Responsive metric sizing is missing.');
  process.exit(1);
}

if (!overview.includes('title={card.helper}')) {
  console.error('[verify-v57.3.2] Hover helper/title support is missing.');
  process.exit(1);
}

if (!release.includes('57.3.2-settings-metrics-tuning')) {
  console.error('[verify-v57.3.2] Release version was not updated.');
  process.exit(1);
}

console.log('[verify-v57.3.2] Settings metrics UI tuning OK');
