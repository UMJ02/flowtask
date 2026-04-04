#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  ".env.example",
  ".nvmrc",
  "README.md",
  "vercel.json",
  ".github/workflows/ci.yml",
  "scripts/verify-v58.10.1.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_1_DEPLOY_PIPELINE_FIX.md",
  "src/lib/release/version.ts",
  "src/components/security/access-summary-card.tsx",
  "src/components/organization/organization-bootstrap-card.tsx",
  "src/app/(app)/app/organization/page.tsx",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.1] Missing ${file}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error("[verify-v58.10.1] Repo verification failed.");
  process.exit(1);
}

console.log("[verify-v58.10.1] OK — deploy pipeline fix listo para continuidad.");
