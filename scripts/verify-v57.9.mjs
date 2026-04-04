import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/lib/release/version.ts",
  "src/app/(app)/app/onboarding/page.tsx",
  "src/app/(app)/app/organization/page.tsx",
  "src/app/(app)/app/organization/billing/page.tsx",
  "src/app/(app)/app/settings/page.tsx",
  "src/app/(app)/app/notifications/page.tsx",
  "src/components/onboarding/account-mode-console.tsx",
  "src/components/organization/organization-members-panel.tsx",
  "src/components/organization/organization-invites-panel.tsx",
  "src/components/organization/billing-command-center.tsx",
  "src/components/settings/profile-settings-form.tsx",
  "src/lib/queries/account-access.ts",
  "src/lib/queries/organization-members.ts",
  "src/lib/queries/billing.ts",
  "src/lib/queries/workspace.ts",
  "supabase/migrations/0028_v57_5_access_onboarding_modernization.sql",
  "supabase/migrations/0029_v57_6_subscription_capacity_controls.sql",
  "supabase/migrations/0030_v57_7_billing_commercial_lifecycle.sql",
  "supabase/migrations/0031_v57_8_individual_mode_guardrails.sql",
  "docs/release/V57_9_DELIVERY_NOTES.md",
  "docs/release/V57_9_QA_MATRIX.md",
  "docs/release/V57_9_PRODUCTION_CHECKLIST.md"
];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  console.error(`[verify-v57.9] Missing required files:
${missing.map((m) => ` - ${m}`).join("\n")}`);
  process.exit(1);
}
console.log("[verify-v57.9] OK");
