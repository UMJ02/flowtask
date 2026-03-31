import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  'package.json',
  'scripts/functional-qa.mjs',
  'scripts/ux-review.mjs',
  'scripts/release-check.mjs',
  'scripts/preprod-validate.mjs',
  'scripts/bugs-template.mjs',
  'V_Report/VERSION_REPORT_v9.0.0-preproduction-full.md',
  'V_Report/PREPRODUCTION_CHECKLIST_v9.md',
  'V_Report/BUG_TRACKING_TEMPLATE_v9.md',
  'V_Report/GO_LIVE_GATE_v9.md',
  'README_V9_PREPROD.md',
];

let failures = 0;

console.log('\n[preprod-validate] Flowtask V9 preproduction gate\n');

for (const file of requiredFiles) {
  const full = path.join(root, file);
  const ok = fs.existsSync(full);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  console.log('\n[preprod-validate] Environment contract');
  for (const key of requiredEnv) {
    const ok = text.includes(key);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}`);
    if (!ok) failures += 1;
  }
}

console.log('\n[preprod-validate] Manual preproduction gates');
console.log('1. Validar login/logout con usuario real');
console.log('2. Validar registro con y sin confirmación de correo');
console.log('3. Crear, editar y eliminar tarea');
console.log('4. Crear, editar y eliminar proyecto');
console.log('5. Confirmar que dashboard carga con y sin datos');
console.log('6. Revisar notificaciones');
console.log('7. Revisar rutas /api/health y /api/ready');
console.log('8. Validar responsive básico');
console.log('9. Ejecutar build');
console.log('10. Registrar bugs encontrados en la plantilla v9');

if (failures > 0) {
  console.error(`\n[preprod-validate] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[preprod-validate] All preproduction checks passed.\n');
