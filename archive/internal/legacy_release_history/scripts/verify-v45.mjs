import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const loginPage = fs.readFileSync(path.join(root, 'src/app/(public)/login/page.tsx'), 'utf8');
const registerPage = fs.readFileSync(path.join(root, 'src/app/(public)/register/page.tsx'), 'utf8');
const loginForm = fs.readFileSync(path.join(root, 'src/components/auth/login-form.tsx'), 'utf8');
const registerForm = fs.readFileSync(path.join(root, 'src/components/auth/register-form.tsx'), 'utf8');

const checks = [
  ['login page centered', loginPage.includes('flex min-h-screen items-center justify-center')),
  ['register page centered', registerPage.includes('flex min-h-screen items-center justify-center')),
  ['success modal used in login', loginForm.includes('Ingreso exitoso')),
  ['password guidance used in register', registerForm.includes('Usa al menos 6 caracteres')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v45] V45 checks OK.\n');
