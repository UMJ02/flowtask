import fs from 'fs';

const required = [
  'src/components/notifications/notifications-command-center.tsx',
  'src/components/notifications/notifications-live-panel.tsx',
  'src/app/api/notifications/test/route.ts',
  'src/app/api/notifications/archive-read/route.ts',
  'src/lib/supabase/admin.ts',
  'src/lib/release/version.ts',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v57.2] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const commandCenter = fs.readFileSync('src/components/notifications/notifications-command-center.tsx', 'utf8');
const livePanel = fs.readFileSync('src/components/notifications/notifications-live-panel.tsx', 'utf8');
const testRoute = fs.readFileSync('src/app/api/notifications/test/route.ts', 'utf8');
const archiveRoute = fs.readFileSync('src/app/api/notifications/archive-read/route.ts', 'utf8');
const release = fs.readFileSync('src/lib/release/version.ts', 'utf8');

if (commandCenter.includes('Política activa')) {
  console.error('[verify-v57.2] Policy card content still exists in the command center.');
  process.exit(1);
}

if (!livePanel.includes('Búsqueda avanzada') || !livePanel.includes('border-t border-slate-200/80')) {
  console.error('[verify-v57.2] Notifications center advanced search and divider layout are missing.');
  process.exit(1);
}

if (!testRoute.includes("from('notifications')") || !testRoute.includes('Notificación de prueba')) {
  console.error('[verify-v57.2] Test notification route is not configured correctly.');
  process.exit(1);
}

if (!archiveRoute.includes('createAdminClient') || !archiveRoute.includes("from('notifications').delete")) {
  console.error('[verify-v57.2] Archive route is not configured correctly.');
  process.exit(1);
}

if (!release.includes('57.2.0-notifications-polish')) {
  console.error('[verify-v57.2] Release version was not updated.');
  process.exit(1);
}

console.log('[verify-v57.2] Notifications polish structure OK');
