import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;

function check(msg, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) failures += 1;
}

console.log('\n[verify:v15] Flowtask V15 clean build fix\n');

const globals = path.join(root, 'src/app/globals.css');
check('globals.css exists', fs.existsSync(globals));

if (fs.existsSync(globals)) {
  const text = fs.readFileSync(globals, 'utf8');
  const hasInvalid =
    text.includes('bg-white/88') ||
    text.includes('bg-white/72') ||
    text.includes('bg-white/82') ||
    text.includes('bg-white/92');
  check('globals.css without invalid bg-white/* classes', !hasInvalid);
}

const board = path.join(root, 'src/components/dashboard/interactive-dashboard-board.tsx');
check('interactive-dashboard-board.tsx exists', fs.existsSync(board));

if (fs.existsSync(board)) {
  const text = fs.readFileSync(board, 'utf8');
  check('TaskRow includes updated_at', text.includes('updated_at?: string | null;'));
}

if (failures > 0) {
  console.error(`\n[verify:v15] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[verify:v15] V15 verification passed.\n');
