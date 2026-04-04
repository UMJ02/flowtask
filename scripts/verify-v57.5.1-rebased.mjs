import fs from 'node:fs';

const checks = [
  'src/app/api/account/select-mode/route.ts',
  'src/app/api/account/redeem-code/route.ts',
  'src/app/api/account/create-workspace/route.ts',
  'src/components/onboarding/account-mode-console.tsx',
  'src/lib/queries/account-access.ts',
  'src/lib/queries/onboarding.ts',
  'src/lib/release/version.ts',
];

for (const file of checks) {
  if (!fs.existsSync(file)) {
    console.error(`[verify-v57.5.1-rebased] Missing: ${file}`);
    process.exit(1);
  }
}

const routeText = fs.readFileSync('src/app/api/account/create-workspace/route.ts', 'utf8');
if (!routeText.includes('organization_limit') || !routeText.includes("redirectTo: '/app/organization'")) {
  console.error('[verify-v57.5.1-rebased] Workspace hardening markers not found.');
  process.exit(1);
}

const accessText = fs.readFileSync('src/lib/queries/account-access.ts', 'utf8');
if (!accessText.includes('redirectTarget')) {
  console.error('[verify-v57.5.1-rebased] redirectTarget missing in account access summary.');
  process.exit(1);
}

console.log('[verify-v57.5.1-rebased] OK');
