#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.2-layout-cleanup-feed-attachment-refinement";
function read(rel) { return fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function must(rel, text, label) { if (!read(rel).includes(text)) failures.push(label || `${rel} must include ${text}`); }
function exists(rel) { if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing ${rel}`); }
const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.21.2") failures.push("verify:current must target verify:v58.21.2");
if (pkg.scripts?.["verify:v58.21.2"] !== "node scripts/verify-v58.21.2.mjs") failures.push("verify:v58.21.2 script must point to this file");
must("src/lib/release/version.ts", expectedVersion, "runtime version must be v58.21.2");
exists("docs/release/V58_21_2_LAYOUT_CLEANUP_FEED_ATTACHMENT_REFINEMENT.md");
exists("docs/qa/FLOWTASK_V58_21_2_LAYOUT_FEED_ATTACHMENTS_QA.md");
must("src/components/tasks/task-operational-feed.tsx", "Actividad del sistema", "task feed must split system activity");
must("src/components/tasks/task-operational-feed.tsx", "Ver menos movimientos", "task feed must support activity expansion");
must("src/components/tasks/task-quick-comment-composer.tsx", "Ver menos comentarios", "comments must support expansion");
must("src/app/(app)/app/projects/page.tsx", "Más filtros", "projects filters must be simplified");
must("src/app/(app)/app/projects/page.tsx", "min-w-[880px]", "projects table min width must be reduced");
must("src/components/attachments/entity-attachments.tsx", "isImageAttachment", "attachments must detect image previews");
must("src/components/attachments/entity-attachments.tsx", "object-cover", "attachments must render thumbnails");
must("src/components/projects/project-detail-pro.tsx", "isImageAttachment", "recent project files must use image previews");
must("src/components/projects/project-inline-tasks.tsx", "xl:grid-cols-[minmax(220px,1fr)_170px_150px_minmax(190px,240px)_130px]", "project quick add must use responsive grid");
if (read("src/app/(app)/app/projects/page.tsx").includes("<th className=\"px-5 py-4\">Prioridad</th>")) failures.push("projects table must not expose fake priority column");
if (failures.length) {
  console.error("[verify:v58.21.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.21.2] OK — Layout cleanup, feed, attachments and responsive project tasks aligned.");
