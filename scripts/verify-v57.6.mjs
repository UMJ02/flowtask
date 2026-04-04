import fs from 'node:fs';
const files = ['src/app/api/organization/invites/route.ts','src/app/api/organization/members/update-role/route.ts','src/components/organization/organization-members-panel.tsx','src/components/organization/organization-invite-form.tsx','docs/release/V57_6_DELIVERY_NOTES.md'];
const missing = files.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error('[verify-v57.6] Missing files:', missing.join(', ')); process.exit(1); }
console.log('[verify-v57.6] OK');
