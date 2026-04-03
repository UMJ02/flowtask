import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { getRuntimeEnvStatus } from '../src/lib/runtime/env';

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

function runStep(label: string, command: string) {
  console.log(`\n[release-check] ${label}`);
  execSync(command, { stdio: 'inherit' });
}

function main() {
  const missingFiles = requiredFiles.filter((file) => !existsSync(file));

  if (missingFiles.length > 0) {
    console.error('[release-check] Missing required project files:');
    for (const file of missingFiles) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  const envStatus = getRuntimeEnvStatus();
  console.log('[release-check] Runtime environment summary');
  for (const item of envStatus) {
    console.log(`- ${item.key}: ${item.present ? 'present' : 'missing'}`);
  }

  runStep('TypeScript', 'npm run typecheck');
  runStep('Runtime env validation', 'npm run runtime:check');

  console.log('\n[release-check] Build note');
  console.log('- next build still depends on a compatible SWC binary in the execution environment.');
  console.log('- On a normal local/CI environment with internet or preinstalled SWC, run: npm run build');
}

main();
