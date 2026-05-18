import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const failures = [];
const requiredFiles = [
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/lib/workspace-system/render-diet.ts",
  "docs/audits/V58_28_13_FINAL_CLEANUP_AUDIT.md",
  "docs/release/V58_28_13_WORKSPACE_PRO_FINAL_CLEANUP_AUDIT_SAFE_DEAD_SURFACE_REMOVAL.md",
  "docs/qa/FLOWTASK_V58_28_13_WORKSPACE_PRO_FINAL_CLEANUP_AUDIT_QA.md"
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}
const scripts = Object.keys(pkg.scripts || {});
if (pkg.version !== "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal") failures.push("package version is not v58.28.13");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.13") failures.push("verify:current is not v58.28.13");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:final-cleanup:ready")) failures.push("build:preflight does not include final cleanup check");
if (scripts.length > 80) failures.push(`Too many active scripts remain: ${scripts.length}`);
const legacyVerifyScripts = scripts.filter((name) => /^verify:v(54|58\.(0|1|2[0-7]))/.test(name));
if (legacyVerifyScripts.length) failures.push(`Legacy verify scripts still exposed in package.json: ${legacyVerifyScripts.join(", ")}`);
const source = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const blockedCopy = ["Actualizando vista", "Usá ⋯", "Arrastrá para actualizar estado"];
for (const text of blockedCopy) {
  if (source.includes(text)) failures.push(`Legacy user-facing copy still present: ${text}`);
}
if (failures.length) {
  console.error("[workspace:final-cleanup:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`[workspace:final-cleanup:ready] OK — active scripts: ${scripts.length}, final cleanup audit aligned.`);
