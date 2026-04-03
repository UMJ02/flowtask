import fs from 'fs';

const required = [
  'src/components/notifications/notification-preferences-form.tsx',
  'src/lib/release/version.ts',
  'docs/release/V57_3_1_DELIVERY_NOTES.md',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v57.3.1] Missing files:\n' + missing.join('\n'));
  process.exit(1);
}

const preferences = fs.readFileSync('src/components/notifications/notification-preferences-form.tsx', 'utf8');
const release = fs.readFileSync('src/lib/release/version.ts', 'utf8');

if (preferences.includes('Frecuencia actual') || preferences.includes('Tipos activos') || preferences.includes('>Canales<')) {
  console.error('[verify-v57.3.1] Preference summary cards still exist.');
  process.exit(1);
}

if (!preferences.includes('Preferencias de notificaciones') || !preferences.includes('Configuración operativa')) {
  console.error('[verify-v57.3.1] Core notification settings blocks are missing.');
  process.exit(1);
}

if (!release.includes('57.3.1-settings-cleanup')) {
  console.error('[verify-v57.3.1] Release version was not updated.');
  process.exit(1);
}

console.log('[verify-v57.3.1] Settings preferences cleanup OK');
