import fs from "node:fs";

const required = [
  ["src/lib/security/organization-access.ts", "membership: matchingMembership"],
  ["src/lib/queries/organization.ts", "preference && preference !== PERSONAL_WORKSPACE_VALUE"],
  ["src/lib/queries/onboarding.ts", "Flowtask inicia siempre desde la cuenta individual"],
  ["src/types/database.ts", "tasks"],
  ["src/types/database.ts", "task_checklist_items"],
  ["src/lib/account/account-model.ts", "organizationAsUser: false"],
  ["supabase/migrations/0042_v58_17_1_account_model_db_contract_fix.sql", "repair_organization_owner_memberships"],
];

const failures = required.filter(([file, needle]) => {
  if (!fs.existsSync(file)) return true;
  return !fs.readFileSync(file, "utf8").includes(needle);
});

if (failures.length) {
  console.error("[v58.17.1] Verification failed:");
  for (const [file, needle] of failures) {
    console.error(`- ${file} missing ${JSON.stringify(needle)}`);
  }
  process.exit(1);
}

console.log("[v58.17.1] Account Model & DB Contract Fix verified.");
