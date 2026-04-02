import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/app/(app)/app/dashboard/page.tsx",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/(app)/app/projects/page.tsx",
  "src/app/(app)/app/tasks/page.tsx",
  "src/app/(app)/app/notifications/page.tsx",
  "src/components/layout/app-footer.tsx",
  "src/components/security/access-summary-card.tsx",
  "src/components/attachments/entity-attachments.tsx",
  "src/lib/queries/access-summary.ts",
  "src/lib/security/client-access.ts",
  "src/lib/security/entity-integrity.ts",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "V_Report/CLIENT_RELEASE_CANDIDATE_SIGNOFF_v53.5.md",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("[release:candidate] Missing artifacts:\n- " + missing.join("\n- "));
  process.exit(1);
}

const signoff = fs.readFileSync(path.join(root, "V_Report/CLIENT_RELEASE_CANDIDATE_SIGNOFF_v53.5.md"), "utf8");
const sections = [
  "Seguridad y acceso",
  "QA funcional",
  "UX/UI cliente",
  "Predeploy",
  "Go/No-Go",
];
const missingSections = sections.filter((section) => !signoff.includes(section));
if (missingSections.length) {
  console.error("[release:candidate] Signoff doc incomplete:\n- " + missingSections.join("\n- "));
  process.exit(1);
}

console.log("[release:candidate] OK · Candidate signoff bundle present.");
