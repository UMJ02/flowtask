import fs from "node:fs";
const required = [
  ["src/lib/account/account-model.ts", "organizationAsUser: false"],
  ["src/types/database.ts", "task_checklist_items"],
  ["supabase/migrations/0043_v58_17_1a_supabase_migration_hotfix.sql", "V58.17.1a Supabase Migration Hotfix"],
  ["supabase/migrations/0043_v58_17_1a_supabase_migration_hotfix.sql", "drop constraint if exists organization_members_role_allowed_v58171"],
  ["supabase/migrations/0043_v58_17_1a_supabase_migration_hotfix.sql", "create unique index if not exists organization_subscriptions_org_unique"],
  ["src/lib/release/version.ts", "58.17.1a-supabase-migration-hotfix"],
  ["package.json", "verify:v58.17.1a"]
];
const failures = required.filter(([file, needle]) => !fs.existsSync(file) || !fs.readFileSync(file, "utf8").includes(needle));
if (failures.length) {
  console.error("[v58.17.1a] Verification failed:");
  for (const [file, needle] of failures) console.error(`- ${file} missing ${JSON.stringify(needle)}`);
  process.exit(1);
}
console.log("[v58.17.1a] Supabase Migration Hotfix verified.");
