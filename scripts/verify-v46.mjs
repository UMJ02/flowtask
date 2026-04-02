import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const brand = fs.readFileSync(path.join(root, 'src/components/auth/auth-brand.tsx'), 'utf8');
const register = fs.readFileSync(path.join(root, 'src/components/auth/register-form.tsx'), 'utf8');
const forgot = fs.readFileSync(path.join(root, 'src/components/auth/forgot-password-form.tsx'), 'utf8');
const reset = fs.readFileSync(path.join(root, 'src/components/auth/reset-password-form.tsx'), 'utf8');

const checks = [
  ['stacked brand exists', brand.includes('flex-col items-center justify-center gap-3')],
  ['register has 2-step notification flow', register.includes("setModalStep('redirecting')") && register.includes("Cuenta creada. Revisa tu correo y confirma para continuar.")),
  ['forgot password upgraded', forgot.includes('Correo enviado') && forgot.includes('enlace seguro')),
  ['reset password upgraded', reset.includes('Contraseña actualizada') && reset.includes('diferente a la anterior')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v46] V46 checks OK.\n');
