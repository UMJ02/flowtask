#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql"), "utf8");
const mustDrop = [
  "drop index if exists public.client_permissions_org_user_idx",
  "drop index if exists public.error_logs_org_idx",
  "drop index if exists public.usage_events_org_idx",
];
const mustKeep = [
  "create index if not exists client_permissions_org_user_client_idx",
  "create index if not exists error_logs_org_created_idx",
  "create index if not exists usage_events_org_created_idx",
  "create index if not exists internal_support_tickets_org_status_created_idx",
];

for (const entry of [...mustDrop, ...mustKeep]) {
  if (!migration.includes(entry)) {
    console.error(`[db-cleanup-check] Missing expected statement: ${entry}`);
    process.exit(1);
  }
}

console.log("[db-cleanup-check] OK");
