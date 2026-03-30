import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  '.env.example',
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  path.join('src', 'components', 'dashboard', 'interactive-dashboard-board.tsx'),
];

const missing = requiredFiles.filter((file) => !existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error('[validate-clean-install] Faltan archivos requeridos:');
  for (const file of missing) console.error(` - ${file}`);
  process.exit(1);
}

const hasNext = existsSync(path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'));
const hasTsc = existsSync(path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'));

if (!hasNext || !hasTsc) {
  console.error('[validate-clean-install] Dependencias incompletas. Ejecuta primero: npm ci');
  process.exit(1);
}

console.log('[validate-clean-install] Base lista para validación local limpia.');
console.log('[validate-clean-install] Siguiente comando recomendado: npm run validate:clean');
