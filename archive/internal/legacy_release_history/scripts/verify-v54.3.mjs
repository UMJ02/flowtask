#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "archive/internal/README.md",
  "archive/internal/legacy_release_history/RT_modulos/flowtask_supabase_v54_2_1_patch.sql",
  "supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql",
  "scripts/verify-v54.3.mjs",
  ".env.example"
];

const forbidden = ["RT_modulos", ".env", ".env.local", ".next", "node_modules", ".git"];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
const presentForbidden = forbidden.filter((rel) => fs.existsSync(path.join(root, rel)));

if (missing.length) {
  console.error("[verify-v54.3] Missing files:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

if (presentForbidden.length) {
  console.error("[verify-v54.3] Forbidden paths still present:");
  presentForbidden.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "54.3.0-repo-cleanup-canonical-history") {
  console.error(`[verify-v54.3] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes("54.3.0-repo-cleanup-canonical-history")) {
  console.error("[verify-v54.3] Release version file not updated.");
  process.exit(1);
}

console.log("[verify-v54.3] OK");
