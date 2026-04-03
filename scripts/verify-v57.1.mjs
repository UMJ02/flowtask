import fs from 'fs';

const required = [
  'src/components/notifications/notifications-command-center.tsx',
  'src/components/notifications/notifications-live-panel.tsx',
  'src/components/notifications/test-notification-button.tsx',
  'src/app/(app)/app/notifications/page.tsx',
  'src/lib/release/version.ts',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v57.1] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const commandCenter = fs.readFileSync('src/components/notifications/notifications-command-center.tsx', 'utf8');
const livePanel = fs.readFileSync('src/components/notifications/notifications-live-panel.tsx', 'utf8');
const page = fs.readFileSync('src/app/(app)/app/notifications/page.tsx', 'utf8');
const release = fs.readFileSync('src/lib/release/version.ts', 'utf8');

if (!commandCenter.includes('TestNotificationButton variant="embedded-dark"')) {
  console.error('[verify-v57.1] Embedded test card is missing from notification command center.');
  process.exit(1);
}

if (page.includes('TestNotificationButton')) {
  console.error('[verify-v57.1] Notifications page still mounts the standalone test button.');
  process.exit(1);
}

if (!livePanel.includes('Panel de seguimiento') || !livePanel.includes('InsightSelector')) {
  console.error('[verify-v57.1] Consolidated tracking card is missing.');
  process.exit(1);
}

if (livePanel.includes('function StatCard')) {
  console.error('[verify-v57.1] Repeated metrics section is still present.');
  process.exit(1);
}

if (!release.includes('57.1.0-notifications-refine')) {
  console.error('[verify-v57.1] Release version was not updated.');
  process.exit(1);
}

console.log('[verify-v57.1] Notifications refinement structure OK');
