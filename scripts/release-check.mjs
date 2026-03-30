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
  for (const file of missingFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const requiredKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
console.log('[release-check] Runtime environment summary');
for (const key of requiredKeys) {
  const present = Boolean(process.env[key] && process.env[key].trim());
  console.log(`- ${key}: ${present ? 'present' : 'missing'}`);
}

runStep('TypeScript', 'npm run typecheck');
runStep('Runtime env validation', 'npm run runtime:check');

console.log('\n[release-check] Build note');
console.log('- next build still depends on a compatible SWC binary in the execution environment.');
console.log('- On a normal local/CI environment with internet or preinstalled SWC, run: npm run build');
