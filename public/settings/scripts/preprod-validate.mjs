#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  '.env.example',
  '.nvmrc',
  'package.json',
  'README.md',
  'vercel.json',
  'docs/release/CLIENT_RELEASE_CHECKLIST.md',
  'docs/release/OPERATIONS_HANDOFF.md',
  'docs/release/DEPLOY_PRODUCTION_RUNBOOK.md',
  'scripts/functional-qa.mjs',
  'scripts/ux-review.mjs',
  'scripts/release-check.mjs',
  'scripts/preprod-validate.mjs',
  'scripts/bugs-template.mjs',
  'scripts/qa-report.mjs',
  'src/app/api/health/route.ts',
  'src/app/api/ready/route.ts',
];

let failures = 0;

console.log('\n[preprod-validate] FlowTask preproduction gate\n');

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
    'NEXT_PUBLIC_APP_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
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
console.log('6. Revisar notificaciones y agenda del día');
console.log('7. Revisar rutas /api/health y /api/ready');
console.log('8. Validar responsive básico por módulos críticos');
console.log('9. Ejecutar build en entorno limpio');
console.log('10. Registrar bugs encontrados antes de producción');

if (failures > 0) {
  console.error(`\n[preprod-validate] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[preprod-validate] All preproduction checks passed.\n');
