import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));

const version = "58.28.0-workspace-pro-production-ux-final";
const verifyTarget = "npm run verify:v58.28.0", "npm run verify:v58.28.1", "npm run verify:v58.28.2", "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9";

if (pkg.version !== version) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== verifyTarget) failures.push("verify:current must target verify:v58.28.0");
if (!pkg.scripts?.["workspace:production-ux:ready"]) failures.push("workspace:production-ux:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:production-ux:ready")) failures.push("build:preflight must include workspace:production-ux:ready");

const checks = [
  ["src/lib/release/version.ts", version],
  ["src/lib/release/version.ts", "v58.28.0 Workspace Pro Production UX Final"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.28.0 — Workspace Pro Production UX Final"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProProductionUXStrip"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "Production UX Final"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "actionLabel=\"Abrir Lista\""],
  ["src/app/globals.css", "v58.28.0 — Workspace Pro Production UX Final"],
  ["src/app/globals.css", "ws-pro-production-ux-strip"],
  ["docs/release/V58_28_0_WORKSPACE_PRO_PRODUCTION_UX_FINAL.md", "v58.28.0"],
  ["docs/qa/FLOWTASK_V58_28_0_WORKSPACE_PRODUCTION_UX_FINAL_QA.md", "v58.28.0"],
];

for (const [file, needle] of checks) {
  if (!read(file).includes(needle)) failures.push(`${file} missing ${needle}`);
}

if (failures.length) {
  console.error("[verify:v58.28.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.0] OK — Workspace Pro production UX final aligned.");
