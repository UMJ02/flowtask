#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql",
  "flowtask_supabase_v54_2_1_patch.sql",
  "scripts/db-cleanup-check.mjs",
  "V_Report/VERSION_REPORT_v54.2.1-db-cleanup-index-normalization.md",
];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  console.error("[verify-v54.2.1] Missing files:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "54.2.1-db-cleanup-index-normalization") {
  console.error(`[verify-v54.2.1] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes("54.2.1-db-cleanup-index-normalization")) {
  console.error("[verify-v54.2.1] Release version file not updated.");
  process.exit(1);
}

console.log("[verify-v54.2.1] OK");
