#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.9.1-visual-style-deduplication-motion-cleanup-pass";
const expectedRelease = "v58.24.9.9.1 Visual Style Deduplication + Motion Cleanup Pass";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.9.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.9.1") failures.push("verify:current must target verify:v58.24.9.9.1");
if ((pkg.scripts ?? {})["verify:v58.24.9.9.1"] !== "node scripts/verify-v58.24.9.9.1.mjs") failures.push("verify:v58.24.9.9.1 script must be available");

requireFile("scripts/verify-v58.24.9.9.1.mjs");
requireFile("docs/release/V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_9_1_VISUAL_STYLE_DEDUPLICATION_MOTION_CLEANUP_PASS_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.9.1");

requireIncludes("src/app/globals.css", "v58.24.9.9.1 — Style deduplication aliases");
requireIncludes("src/app/globals.css", ".ft-border");
requireIncludes("src/app/globals.css", ".ft-text-main");
requireIncludes("src/app/globals.css", ".ft-text-muted");
requireIncludes("src/app/globals.css", ".ft-control");

const srcFiles = fs.readdirSync(path.join(root, "src"), { recursive: true })
  .filter((file) => typeof file === "string" && /\.(tsx|ts)$/.test(file))
  .map((file) => path.join("src", file));

function countPattern(pattern) {
  return srcFiles.reduce((total, file) => total + (read(file).match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))?.length ?? 0), 0);
}

if (countPattern("border-[#E5EAF1]") !== 0) failures.push("Old border token border-[#E5EAF1] must be fully removed from src TS/TSX.");
if (countPattern("text-[#0F172A]") !== 0) failures.push("Old text token text-[#0F172A] must be fully removed from src TS/TSX.");
if (countPattern("text-[#64748B]") !== 0) failures.push("Old muted text token text-[#64748B] must be fully removed from src TS/TSX.");
if (countPattern("hover:-translate") !== 0) failures.push("Decorative hover:-translate must be removed from src TS/TSX.");

requireNotIncludes("src/components/tasks/task-action-list.tsx", "rounded-[");
requireNotIncludes("src/components/tasks/task-action-list.tsx", "animate-pulse");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "rounded-[");
requireNotIncludes("src/components/tasks/task-kanban-board.tsx", "animate-pulse");
requireIncludes("src/components/tasks/task-action-list.tsx", "ft-border");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "ft-apple-card");

if (failures.length) {
  console.error("[verify:v58.24.9.9.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.9.1] OK — Visual style deduplication and motion cleanup aligned.");
