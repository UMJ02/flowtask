import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/components/settings/profile-settings-form.tsx',
  'src/app/(app)/app/profile/page.tsx',
  'src/lib/release/version.ts',
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('[verify-v57.4.1] Missing required files:');
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const profileForm = fs.readFileSync(path.join(root, 'src/components/settings/profile-settings-form.tsx'), 'utf8');
const versionFile = fs.readFileSync(path.join(root, 'src/lib/release/version.ts'), 'utf8');

if (!profileForm.includes('rounded-full') || !profileForm.includes('Identidad de perfil')) {
  console.error('[verify-v57.4.1] Identity card refresh was not applied.');
  process.exit(1);
}

if (!versionFile.includes('57.4.1-profile-identity-card-refresh')) {
  console.error('[verify-v57.4.1] Version metadata is not updated to v57.4.1.');
  process.exit(1);
}

console.log('[verify-v57.4.1] OK');
