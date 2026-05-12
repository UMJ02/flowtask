#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = '58.25.6.4-organization-settings-notifications-ui-system-final-alignment';
const expectedRelease = 'v58.25.6.4 Organization + Settings + Notifications UI System Final Alignment';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.4');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.4') failures.push('verify:current must target verify:v58.25.6.4');
if ((pkg.scripts ?? {})['verify:v58.25.6.4'] !== 'node scripts/verify-v58.25.6.4.mjs') failures.push('verify:v58.25.6.4 script missing');

requireFile('docs/release/V58_25_6_4_ORGANIZATION_SETTINGS_NOTIFICATIONS_UI_SYSTEM_FINAL_ALIGNMENT.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_4_ORGANIZATION_SETTINGS_NOTIFICATIONS_UI_SYSTEM_FINAL_ALIGNMENT_QA.md');
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/app/globals.css', 'v58.25.6.4 — Organization + Settings + Notifications UI System Final Alignment');
requireIncludes('src/app/globals.css', '.ft-org-screen');
requireIncludes('src/app/globals.css', '.ft-settings-screen');
requireIncludes('src/app/globals.css', '.ft-notifications-ui-screen');
requireIncludes('src/app/globals.css', '.ft-profile-screen');
requireIncludes('src/app/globals.css', '.ft-settings-danger-panel');
requireIncludes('src/app/globals.css', '.ft-notifications-system-chip');

requireIncludes('src/app/(app)/app/organization/page.tsx', 'ft-org-screen');
requireIncludes('src/app/(app)/app/organization/page.tsx', 'ft-org-hero');
requireIncludes('src/app/(app)/app/settings/page.tsx', 'ft-settings-screen');
requireIncludes('src/app/(app)/app/settings/page.tsx', 'ft-settings-panel');
requireIncludes('src/app/(app)/app/notifications/page.tsx', 'ft-notifications-ui-screen');
requireIncludes('src/app/(app)/app/profile/page.tsx', 'ft-profile-screen');
requireIncludes('src/app/(app)/app/profile/page.tsx', 'ft-profile-hero');
requireNotIncludes('src/app/(app)/app/profile/page.tsx', 'bg-[linear-gradient(135deg,#0f172a');

requireIncludes('src/components/settings/settings-account-overview.tsx', 'ft-settings-hero-system');
requireIncludes('src/components/settings/settings-account-overview.tsx', 'ft-settings-metric-grid');
requireIncludes('src/components/settings/account-danger-zone.tsx', 'ft-settings-danger-panel');
requireIncludes('src/components/notifications/notifications-command-center.tsx', 'ft-notifications-hero-system');
requireIncludes('src/components/notifications/notifications-command-center.tsx', 'ft-notifications-metric-grid');
requireIncludes('src/components/notifications/notifications-live-panel.tsx', 'ft-notifications-ui-panel');
requireIncludes('src/components/notifications/notifications-live-panel.tsx', 'ft-notification-system-row');

if (failures.length) {
  console.error('[verify:v58.25.6.4] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.4] OK — Organization + Settings + Notifications UI final alignment ready.');
