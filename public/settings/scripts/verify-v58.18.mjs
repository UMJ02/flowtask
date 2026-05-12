import fs from 'node:fs';

const required = [
  'src/lib/actions/onboarding-demo-data.ts',
  'src/lib/queries/onboarding.ts',
  'src/components/onboarding/workspace-onboarding.tsx',
  'docs/release/V58_18_CLIENT_READY_ONBOARDING_DEMO_DATA.md',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('[verify-v58.18] Missing files:', missing.join(', '));
  process.exit(1);
}

const action = fs.readFileSync('src/lib/actions/onboarding-demo-data.ts', 'utf8');
const checks = [
  'existingProjects > 0 || existingTasks > 0',
  'organization_id: organizationId',
  'owner_id: userId',
  'task_checklist_items',
  'revalidatePath("/app/onboarding")',
];

const failed = checks.filter((needle) => !action.includes(needle));
if (failed.length) {
  console.error('[verify-v58.18] Failed checks:', failed.join(', '));
  process.exit(1);
}

console.log('[verify-v58.18] OK');
