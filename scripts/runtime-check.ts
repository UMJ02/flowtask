import { getRuntimeEnvStatus } from '../src/lib/runtime/env';

function main() {
  const status = getRuntimeEnvStatus();
  const missing = status.filter((item) => !item.present);

  if (missing.length > 0) {
    console.error('[runtime-check] Missing variables:');
    for (const item of missing) {
      console.error(`- ${item.key}`);
    }
    process.exit(1);
  }

  console.log('[runtime-check] OK');
  for (const item of status) {
    console.log(`- ${item.key}: present`);
  }
}

main();
