import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'package.json',
  'next.config.ts',
  '.env.example',
  'src/lib/runtime/env.ts',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/middleware.ts',
  'src/middleware.ts',
];

function runStep(label, command, env = process.env) {
  console.log(`\n[release-check] ${label}`);
  execSync(command, { stdio: 'inherit', env });
}

const missingFiles = requiredFiles.filter((file) => !existsSync(file));
if (missingFiles.length > 0) {
  console.error('[release-check] Missing required project files:');
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

console.log('[release-check] Runtime environment summary');
for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
  const present = Boolean(process.env[key] && process.env[key].trim());
  console.log(`- ${key}: ${present ? 'present' : 'missing'}`);
}

runStep('Runtime env validation', 'npm run runtime:check');
runStep('TypeScript', 'npm run typecheck');

console.log('\n[release-check] Build handoff');
console.log('- Local/Vercel next build should be run after this step in a clean install environment.');
console.log('- Recommended command: npm run build');
