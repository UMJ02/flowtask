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
  "scripts/verify-v58.10.7.mjs",
  "scripts/verify-v58.10.8.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_7_WORKSPACE_ISOLATION_LIVE_SWITCH_FIX.md",
  "docs/release/V58_10_8_ORGANIZATION_UI_UX_POLISH.md",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "src/lib/release/version.ts",
  "src/app/(app)/app/organization/page.tsx",
  "src/components/organization/organization-identity-card.tsx",
  "src/components/organization/organization-access-tabs-panel.tsx",
  "src/components/organization/organization-members-panel.tsx",
  "src/components/organization/organization-roles-panel.tsx",
  "src/components/organization/organization-invite-form.tsx",
  "src/components/activity/activity-timeline.tsx",
  "supabase/master/flowtask_supabase_master_fixed.sql",
  "supabase/migrations/0034_v59_organization_founder_bootstrap_fix.sql",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.8] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error("[verify-v58.10.8] Repo verification failed.");
  process.exit(1);
}

console.log("[verify-v58.10.8] OK — organization UI/UX polish listo para continuidad.");
