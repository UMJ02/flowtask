import fs from 'node:fs';

const required = [
  'src/components/layout/app-header.tsx',
  'src/components/layout/app-sidebar.tsx',
  'src/components/layout/app-footer.tsx',
  'src/components/layout/sidebar-footer.tsx',
  'src/components/layout/command-palette.tsx',
  'src/components/notifications/notification-bell.tsx',
  'src/components/layout/user-menu.tsx',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify:v58.13.7] Missing files:', missing.join(', '));
  process.exit(1);
}

const header = fs.readFileSync('src/components/layout/app-header.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/layout/app-sidebar.tsx', 'utf8');
const footer = fs.readFileSync('src/components/layout/app-footer.tsx', 'utf8');
const checks = [
  ['header search/theme shell', header.includes('Cambiar tema') && header.includes('CommandPalette')],
  ['sidebar width polish', sidebar.includes('md:w-[280px]') && sidebar.includes('md:w-[88px]')],
  ['sidebar gradient polish', sidebar.includes('linear-gradient(180deg,#071120,#08162A)')],
  ['footer simple shell', footer.includes('© 2026 FlowTask · Costa Rica') && footer.includes('Privacidad')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('[verify:v58.13.7] Failed checks:');
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log('[verify:v58.13.7] OK — Header / Sidebar / Footer polish aligned.');
