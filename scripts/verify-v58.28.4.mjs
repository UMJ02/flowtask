#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const failures = [];
if (pkg.version !== "58.28.4-workspace-pro-board-overlay-status-alignment") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.4") failures.push("verify:current must target verify:v58.28.4");
const checks = [
  ["src/lib/release/version.ts", "v58.28.4 Workspace Pro Board Overlay + Status Schema Alignment"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "v58.28.4 — Workspace Pro Board Overlay + Status Schema Alignment"],
  ["src/app/globals.css", "v58.28.4 — Workspace Pro Board Overlay + Status Schema Alignment"],
  ["supabase/migrations/0055_v58_28_4_task_status_pending_review.sql", "Pendiente y Revisión"],
  ["docs/release/V58_28_4_WORKSPACE_PRO_BOARD_OVERLAY_STATUS_ALIGNMENT.md", "v58.28.4"],
  ["docs/qa/FLOWTASK_V58_28_4_WORKSPACE_PRO_BOARD_OVERLAY_STATUS_ALIGNMENT_QA.md", "v58.28.4"],
];
for (const [file, marker] of checks) {
  if (!fs.existsSync(file)) failures.push(`Missing ${file}`);
  else if (!fs.readFileSync(file, "utf8").includes(marker)) failures.push(`Missing marker in ${file}: ${marker}`);
}
if (failures.length) {
  console.error("[verify:v58.28.4] FAIL");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("[verify:v58.28.4] OK — Workspace Pro board overlay and status alignment ready.");
