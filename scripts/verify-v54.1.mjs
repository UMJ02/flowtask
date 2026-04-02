#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/app/api/internal/log/route.ts",
  "src/app/api/support/route.ts",
  "src/app/api/usage/track/route.ts",
  "src/app/(app)/app/support/page.tsx",
  "src/components/support/support-center.tsx",
  "src/hooks/use-error-logger.ts",
  "src/lib/telemetry/track-event.ts",
  "supabase/migrations/0025_v54_1_observability_support_metrics.sql",
];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  console.error("[verify-v54.1] Missing files:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const versionFile = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
if (!versionFile.includes('54.1.0-observability-support-metrics')) {
  console.error("[verify-v54.1] Version file not updated.");
  process.exit(1);
}

console.log("[verify-v54.1] OK");
