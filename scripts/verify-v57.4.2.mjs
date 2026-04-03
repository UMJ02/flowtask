
import fs from 'node:fs';

const checks = [
  'src/components/settings/settings-account-overview.tsx',
  'src/lib/release/version.ts',
  'docs/release/V57_4_2_DELIVERY_NOTES.md',
];

for (const file of checks) {
  if (!fs.existsSync(file)) {
    console.error(`Missing: ${file}`);
    process.exit(1);
  }
}

const overview = fs.readFileSync('src/components/settings/settings-account-overview.tsx', 'utf8');
if (!overview.includes("'Sin espacios'")) throw new Error('Tooltip Sin espacios missing');
if (!overview.includes("'Sin clientes'")) throw new Error('Tooltip Sin clientes missing');
if (!overview.includes("'Solo in-app'")) throw new Error('Tooltip Solo in-app missing');

console.log('V57.4.2 OK');
