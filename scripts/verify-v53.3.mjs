import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "supabase/migrations/0021_v53_3_production_release_hardening.sql",
  "src/lib/release/version.ts",
  "src/lib/security/entity-integrity.ts",
  "V_Report/VERSION_REPORT_v53.3.0-production-release-hardening.md",
  "archive/internal/legacy_release_history/RT_modulos/flowtask_supabase_v53_3_patch.sql",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[verify:v53.3] Missing files:\n- " + missing.join("\n- "));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "53.3.0-production-release-hardening") {
  console.error(`[verify:v53.3] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

console.log("[verify:v53.3] OK · Production Release Hardening bundle detected.");
