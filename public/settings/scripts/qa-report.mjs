import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'V_Report');
const outFile = path.join(outDir, 'QA_EXECUTION_REPORT_v6.md');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const lines = [
  '# QA Execution Report v6',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Recommended local execution order',
  '',
  '1. npm install',
  '2. npm run validate:env',
  '3. npm run doctor:supabase',
  '4. npm run qa:smoke-local',
  '5. npm run qa:functional',
  '6. npm run build',
  '7. npm run smoke:health',
  '',
  '## Manual core flow',
  '',
  '- Login',
  '- Register',
  '- Forgot/reset password',
  '- Dashboard initial load',
  '- Task create/edit/delete',
  '- Project create/edit/delete',
  '- Notifications view',
  '- Logout',
  '',
  '## Notes',
  '',
  '- This report is generated locally and is meant to document QA execution.',
  '- Mark pass/fail results directly in this file after your local run.'
];

fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
console.log(`[qa-report] Wrote ${path.relative(root, outFile)}`);
