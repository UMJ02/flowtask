import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const pageText = readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const emptyText = readFileSync("src/components/workspace-system/workspace-empty-state.tsx", "utf8");
const failures = [];
const expectedVersion = "58.28.19-ux-copy-empty-states-final";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.19") failures.push("verify:current must target verify:v58.28.19");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:final-copy:ready")) failures.push("build:preflight must include workspace:final-copy:ready");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.19 slug");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");
if (!pageText.includes("Todavía no hay tareas")) failures.push("Workspace Pro tasks empty state must use final user copy");
if (!pageText.includes("El board está vacío")) failures.push("Workspace Pro board empty state must use final user copy");
if (!pageText.includes("Todo el trabajo")) failures.push("Reports scope copy must use Todo el trabajo");
if (!emptyText.includes("Estado del espacio")) failures.push("Workspace health panel must use user-facing Spanish copy");

if (failures.length) {
  console.error("[verify:v58.28.19] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.19] OK — UX copy and final empty states aligned.");
