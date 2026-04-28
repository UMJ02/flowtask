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
  "scripts/verify-v58.10.4.mjs",
  "scripts/verify-v58.10.5.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_4_RELEASE_EXPORTS_FIX.md",
  "docs/release/V58_10_5_MASTER_ALIGNMENT_CONTINUITY_FIX.md",
  "docs/release/DB_CONTINUITY_SOURCE_OF_TRUTH.md",
  "REQUIRED_DEPLOY_FILES_LOCATION.md",
  "src/lib/release/version.ts",
  "src/components/security/access-summary-card.tsx",
  "src/components/organization/organization-bootstrap-card.tsx",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "src/components/layout/app-footer.tsx",
  "supabase/master/flowtask_supabase_master_fixed.sql",
  "supabase/migrations/0034_v59_organization_founder_bootstrap_fix.sql",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.5] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error("[verify-v58.10.5] Repo verification failed.");
  process.exit(1);
}

console.log("[verify-v58.10.5] OK — master alignment continuity fix listo para depuración y continuidad.");
