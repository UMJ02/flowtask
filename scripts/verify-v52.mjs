import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const orgPage = fs.readFileSync(path.join(root, 'src/app/(app)/app/organization/page.tsx'), 'utf8');
const members = fs.readFileSync(path.join(root, 'src/components/organization/organization-members-panel.tsx'), 'utf8');
const invites = fs.readFileSync(path.join(root, 'src/components/organization/organization-invites-panel.tsx'), 'utf8');
const nav = fs.readFileSync(path.join(root, 'src/components/layout/nav-links.ts'), 'utf8');
const checks = [
  ['organization page loads real members', orgPage.includes('getOrganizationMembers')),
  ['members panel is interactive', members.includes('updateRole(') && members.includes('organization_members')),
  ['invites panel can revoke', invites.includes('Revocar') && invites.includes('organization_invites')),
  ['organization added to nav', nav.includes("href: '/app/organization'")),
];
let failures = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); if (!ok) failures += 1; }
if (failures > 0) process.exit(1);
console.log('\n[verify:v52] V52 checks OK.\n');
