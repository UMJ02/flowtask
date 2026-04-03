import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/app/(app)/app/profile/page.tsx',
  'src/app/(app)/app/settings/page.tsx',
  'src/components/settings/profile-settings-form.tsx',
  'src/components/settings/settings-account-overview.tsx',
  'src/components/layout/user-menu.tsx',
  'src/components/layout/sidebar-footer.tsx',
  'src/lib/queries/profile.ts',
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('[verify-v57.4] Missing required files:');
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const settingsPage = fs.readFileSync(path.join(root, 'src/app/(app)/app/settings/page.tsx'), 'utf8');
const profilePage = fs.readFileSync(path.join(root, 'src/app/(app)/app/profile/page.tsx'), 'utf8');
const userMenu = fs.readFileSync(path.join(root, 'src/components/layout/user-menu.tsx'), 'utf8');

if (settingsPage.includes('ProfileSettingsForm')) {
  console.error('[verify-v57.4] Settings still renders ProfileSettingsForm.');
  process.exit(1);
}

if (!profilePage.includes('ProfileSettingsForm')) {
  console.error('[verify-v57.4] Profile page does not render ProfileSettingsForm.');
  process.exit(1);
}

if (!userMenu.includes('/app/profile')) {
  console.error('[verify-v57.4] User menu is not linked to /app/profile.');
  process.exit(1);
}

console.log('[verify-v57.4] OK');
