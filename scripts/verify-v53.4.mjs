import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "supabase/migrations/0022_v53_4_permissions_qa_ux_polish.sql",
  "flowtask_supabase_v53_4_patch.sql",
  "src/lib/release/version.ts",
  "src/lib/queries/access-summary.ts",
  "src/components/security/access-summary-card.tsx",
  "V_Report/VERSION_REPORT_v53.4.0-permissions-qa-ux-polish.md",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[verify:v53.4] Missing files:\n- " + missing.join("\n- "));
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.version !== "53.4.0-permissions-qa-ux-polish") {
  console.error(`[verify:v53.4] package.json version mismatch: ${packageJson.version}`);
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes("53.4.0-permissions-qa-ux-polish")) {
  console.error("[verify:v53.4] release version file is not aligned.");
  process.exit(1);
}

console.log("[verify:v53.4] OK · Permissions QA UX Polish bundle detected.");
