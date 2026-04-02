#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "supabase/migrations/0026_v54_2_performance_optimization.sql"), "utf8");
const expectations = [
  "projects_org_created_idx",
  "tasks_org_status_due_idx",
  "client_permissions_org_user_client_idx",
  "support_tickets_org_status_created_idx",
];

for (const item of expectations) {
  if (!migration.includes(item)) {
    console.error(`[performance-check] Missing index ${item}`);
    process.exit(1);
  }
}

console.log("[performance-check] OK");
