#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/lib/performance/server-cache.ts",
  "src/lib/queries/projects.ts",
  "src/lib/queries/tasks.ts",
  "src/components/dashboard/interactive-dashboard-board.tsx",
  "src/components/tasks/task-action-list.tsx",
  "src/components/tasks/task-kanban-board.tsx",
  "supabase/migrations/0026_v54_2_performance_optimization.sql",
];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  console.error("[verify-v54.2] Missing files:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes('54.2.0-performance-optimization')) {
  console.error("[verify-v54.2] Version file not updated.");
  process.exit(1);
}

console.log("[verify-v54.2] OK");
