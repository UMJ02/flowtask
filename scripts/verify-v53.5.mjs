import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "supabase/migrations/0023_v53_5_release_candidate.sql",
  "flowtask_supabase_v53_5_patch.sql",
  "src/lib/release/version.ts",
  "src/components/layout/app-footer.tsx",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "scripts/release-candidate-signoff.mjs",
  "V_Report/VERSION_REPORT_v53.5.0-release-candidate.md",
  "V_Report/CLIENT_RELEASE_CANDIDATE_SIGNOFF_v53.5.md",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[verify:v53.5] Missing files:\n- " + missing.join("\n- "));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "53.5.0-release-candidate") {
  console.error(`[verify:v53.5] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes("53.5.0-release-candidate") || !versionFile.includes("release-candidate")) {
  console.error("[verify:v53.5] release version file is not aligned.");
  process.exit(1);
}

console.log("[verify:v53.5] OK · Release Candidate bundle detected.");
