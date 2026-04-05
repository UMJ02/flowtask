#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  ".env.example",
  ".nvmrc",
  "README.md",
  "vercel.json",
  "scripts/verify-v58.10.4.mjs",
  "scripts/verify-v58.10.5.mjs",
  "scripts/verify-v58.10.6.mjs",
  "scripts/build-deploy-readiness.mjs",
  "scripts/deploy-production-readiness.mjs",
  "docs/release/V58_10_4_RELEASE_EXPORTS_FIX.md",
  "docs/release/V58_10_5_CLIENT_CLEANUP_FOUNDATION.md",
  "docs/release/V58_10_6_BOARD_FINAL_ALIGNMENT.md",
  "REQUIRED_DEPLOY_FILES_LOCATION.md",
  "src/lib/release/version.ts",
  "src/components/dashboard/interactive-dashboard-board.tsx",
  "src/components/security/access-summary-card.tsx",
  "src/components/organization/organization-bootstrap-card.tsx",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "src/components/layout/app-footer.tsx",
  "archive/internal/local_artifacts/README.md",
];

const forbiddenRootPaths = [
  ".env",
  ".env.local",
  ".next",
  "node_modules",
  ".git",
  ".vercel",
  "flowtask@58.10.1-deploy-pipeline-fix",
];

let failures = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`[verify-v58.10.6] Missing ${file}`);
    failures += 1;
  }
}

for (const rel of forbiddenRootPaths) {
  if (fs.existsSync(path.join(root, rel))) {
    console.error(`[verify-v58.10.6] Forbidden root path present: ${rel}`);
    failures += 1;
  }
}

const versionFile = fs.readFileSync(path.join(root, 'src/lib/release/version.ts'), 'utf8');
if (!versionFile.includes('58.10.6-board-final-alignment')) {
  console.error('[verify-v58.10.6] Release version.ts is not aligned to v58.10.6.');
  failures += 1;
}

const packageJson = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
if (!packageJson.includes('"verify:v58.10.6"')) {
  console.error('[verify-v58.10.6] package.json missing verify:v58.10.6');
  failures += 1;
}
if (packageJson.includes('"verify:current": "npm run verify:v58.10.5"')) {
  console.error('[verify-v58.10.6] verify:current is still pointing to v58.10.5');
  failures += 1;
}

const boardFile = fs.readFileSync(path.join(root, 'src/components/dashboard/interactive-dashboard-board.tsx'), 'utf8');
if (boardFile.includes('Agenda visible') || boardFile.includes('Tareas destacadas')) {
  console.error('[verify-v58.10.6] Board still contains removed dashboard sections.');
  failures += 1;
}
if (!boardFile.includes('Lo que sigue hoy') || !boardFile.includes('Deja avisos rápidos para organizarte durante el dia.') || !boardFile.includes('Agregar aviso') || !boardFile.includes('Avisos rápidos')) {
  console.error('[verify-v58.10.6] Board copy is not fully aligned to the requested final state.');
  failures += 1;
}

if (failures > 0) {
  console.error('[verify-v58.10.6] Repo verification failed.');
  process.exit(1);
}

console.log('[verify-v58.10.6] OK — board final alignment listo para continuidad.');
