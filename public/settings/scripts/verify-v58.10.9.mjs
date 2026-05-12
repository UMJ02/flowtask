#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  ".env.example",
  ".nvmrc",
  ".gitignore",
  "README.md",
  "vercel.json",
  "scripts/verify-v58.10.8.mjs",
  "scripts/verify-v58.10.9.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_8_ORGANIZATION_UI_UX_POLISH.md",
  "docs/release/V58_10_9_ORGANIZATION_MANAGEMENT_UI_REFINE.md",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "src/lib/release/version.ts",
  "src/app/(app)/app/organization/page.tsx",
  "src/components/organization/organization-identity-card.tsx",
  "src/components/organization/organization-access-tabs-panel.tsx",
  "src/components/organization/organization-members-panel.tsx",
  "src/components/organization/organization-roles-panel.tsx",
  "src/components/organization/organization-invite-form.tsx",
  "src/components/organization/organization-admin-settings-card.tsx",
  "src/app/api/organization/manage/route.ts",
  "src/components/activity/activity-timeline.tsx",
  "supabase/master/flowtask_supabase_master_fixed.sql",
  "supabase/migrations/0034_v59_organization_founder_bootstrap_fix.sql",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.9] Missing ${file}`);
    failures += 1;
  }
}
if (failures > 0) {
  console.error("[verify-v58.10.9] Repo verification failed.");
  process.exit(1);
}
console.log("[verify-v58.10.9] OK — organization management UI refine listo para continuidad.");
