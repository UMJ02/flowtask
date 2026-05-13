#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.7.6-report-metrics-buckets-priority-star-export-alignment";
const expectedRelease = "v58.25.7.6 Report Metrics Buckets + Priority Star Export Alignment";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.6");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.6") failures.push("verify:current must target verify:v58.25.7.6");
if ((pkg.scripts ?? {})["verify:v58.25.7.6"] !== "node scripts/verify-v58.25.7.6.mjs") failures.push("verify:v58.25.7.6 script missing");

requireFile("docs/release/V58_25_7_6_REPORT_METRICS_BUCKETS_PRIORITY_STAR_EXPORT_ALIGNMENT.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_6_REPORT_METRICS_BUCKETS_PRIORITY_STAR_EXPORT_ALIGNMENT_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/lib/queries/analytics.ts", "importantItems");
requireIncludes("src/lib/queries/analytics.ts", "currentWeekItems");
requireIncludes("src/lib/queries/analytics.ts", "currentMonthItems");
requireIncludes("src/lib/queries/analytics.ts", "upcomingItems");
requireIncludes("src/lib/queries/analytics.ts", "undatedItems");
requireIncludes("src/lib/queries/analytics.ts", "function isImportantTask");
requireIncludes("src/lib/queries/analytics.ts", "task.priority === 'alta'");
requireNotIncludes("src/lib/queries/analytics.ts", "dayTasks");
requireNotIncludes("src/lib/queries/analytics.ts", "weeklyInProgress");

requireIncludes("src/lib/share/analytics-share.ts", "Importantes");
requireIncludes("src/lib/share/analytics-share.ts", "Semana actual");
requireIncludes("src/lib/share/analytics-share.ts", "Mes actual");
requireIncludes("src/lib/share/analytics-share.ts", "Próximas");
requireIncludes("src/lib/share/analytics-share.ts", "Sin fecha");
requireIncludes("src/lib/share/analytics-share.ts", "Tipo");
requireNotIncludes("src/lib/share/analytics-share.ts", "Tareas del día");
requireNotIncludes("src/lib/share/analytics-share.ts", "Tareas en proceso semanal");

requireIncludes("src/components/shared/shared-analytics-landing.tsx", "payload.shareDigest.weekCount");
requireIncludes("src/components/shared/shared-analytics-landing.tsx", "payload.shareDigest.monthCount");
requireIncludes("src/components/shared/shared-analytics-landing.tsx", "task.itemType");
requireNotIncludes("src/components/shared/shared-analytics-landing.tsx", "Tareas del día");

if (failures.length) {
  console.error("[verify:v58.25.7.6] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.6] OK — report buckets and priority star export alignment validated.");
