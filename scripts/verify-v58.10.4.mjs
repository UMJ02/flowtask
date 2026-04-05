#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  ".env.example",
  ".nvmrc",
  "README.md",
  "vercel.json",
  "scripts/verify-v58.10.3.mjs",
  "scripts/verify-v58.10.4.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_3_VERIFY_ALIGNMENT_FIX.md",
  "docs/release/V58_10_4_RELEASE_EXPORTS_FIX.md",
  "REQUIRED_DEPLOY_FILES_LOCATION.md",
  "src/lib/release/version.ts",
  "src/components/security/access-summary-card.tsx",
  "src/components/organization/organization-bootstrap-card.tsx",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "src/components/layout/app-footer.tsx",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.4] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error("[verify-v58.10.4] Repo verification failed.");
  process.exit(1);
}

console.log("[verify-v58.10.4] OK — release exports fix listo para continuidad.");
