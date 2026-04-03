import fs from 'fs';

const required = [
  'src/components/settings/settings-account-overview.tsx',
  'src/components/notifications/notification-preferences-form.tsx',
  'src/components/settings/automation-control-center.tsx',
  'src/lib/release/version.ts',
  'docs/release/V57_3_DELIVERY_NOTES.md',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v57.3] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const overview = fs.readFileSync('src/components/settings/settings-account-overview.tsx', 'utf8');
const preferences = fs.readFileSync('src/components/notifications/notification-preferences-form.tsx', 'utf8');
const automation = fs.readFileSync('src/components/settings/automation-control-center.tsx', 'utf8');
const release = fs.readFileSync('src/lib/release/version.ts', 'utf8');

if (overview.includes('Sesión') || overview.includes('Estado ejecutivo')) {
  console.error('[verify-v57.3] Settings overview still contains removed executive/session blocks.');
  process.exit(1);
}

if (!preferences.includes('Modificar') || !preferences.includes('Configuración operativa') || preferences.includes('Resumen diario</h3>')) {
  console.error('[verify-v57.3] Settings notification cleanup is incomplete.');
  process.exit(1);
}

if (automation.includes('Estado actual')) {
  console.error('[verify-v57.3] Automation control center still contains the status card.');
  process.exit(1);
}

if (!release.includes('57.3.0-settings-polish')) {
  console.error('[verify-v57.3] Release version was not updated.');
  process.exit(1);
}

console.log('[verify-v57.3] Settings polish structure OK');
