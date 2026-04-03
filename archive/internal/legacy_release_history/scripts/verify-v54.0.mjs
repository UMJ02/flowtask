import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "supabase/migrations/0024_v54_0_client_final.sql",
  "archive/internal/legacy_release_history/RT_modulos/flowtask_supabase_v54_0_patch.sql",
  "src/lib/release/version.ts",
  "src/components/layout/app-footer.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "scripts/client-final-signoff.mjs",
  "V_Report/VERSION_REPORT_v54.0.0-client-final.md",
  "V_Report/CLIENT_FINAL_SIGNOFF_v54.0.md",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[verify:v54.0] Missing files:\n- " + missing.join("\n- "));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "54.0.0-client-final") {
  console.error(`[verify:v54.0] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes("54.0.0-client-final") || !versionFile.includes("final")) {
  console.error("[verify:v54.0] release version file is not aligned.");
  process.exit(1);
}

console.log("[verify:v54.0] OK · Client Final bundle detected.");
