#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const requiredFiles = [
  ".env.example", ".nvmrc", ".gitignore", "README.md", "vercel.json",
  "scripts/verify-v58.11.1.mjs", "scripts/build-deploy-readiness.mjs", "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_11_1_PREMIUM_POLISH_SOFT_DELETE_REACTIVATION.md",
  "src/lib/release/version.ts",
  "src/app/(app)/app/organization/page.tsx",
  "src/components/layout/organization-switcher.tsx",
  "src/components/organization/deleted-organizations-panel.tsx",
  "src/components/organization/organization-reactivation-modal.tsx",
  "src/components/organization/organization-access-tabs-panel.tsx",
  "src/components/organization/organization-admin-settings-card.tsx",
  "src/components/organization/organization-invites-panel.tsx",
  "src/app/api/organization/manage/route.ts",
  "src/app/api/organization/invites/route.ts",
  "src/lib/email/resend.ts",
  "supabase/migrations/0035_v58_11_1_organization_soft_delete_and_reactivation.sql"
];
let failures = 0;
for (const file of requiredFiles) { if (!fs.existsSync(path.join(root, file))) { console.error(`[verify-v58.11.1] Missing ${file}`); failures += 1; } }
if (failures > 0) { console.error("[verify-v58.11.1] Repo verification failed."); process.exit(1); }
console.log("[verify-v58.11.1] OK — premium polish y soft delete/reactivation listos.");
