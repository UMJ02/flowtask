#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.23.3-board-templates-comments-activity";

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function requireFile(rel) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing required file: ${rel}`);
}
function requireIncludes(rel, text) {
  const content = read(rel);
  if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`);
}

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.23.3") failures.push("verify:current must target verify:v58.23.3");
if (pkg.scripts?.["verify:v58.23.3"] !== "node scripts/verify-v58.23.3.mjs") failures.push("verify:v58.23.3 script missing or incorrect");

for (const rel of [
  "src/components/boards/board-element.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/components/boards/floating-format-toolbar.tsx",
  "src/components/boards/board-page.tsx",
  "src/lib/boards/board-types.ts",
  "src/lib/boards/board-serialization.ts",
  "src/lib/boards/board-templates.ts",
  "src/components/boards/board-comments-activity.tsx",
  "supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql",
  "docs/release/V58_23_3_BOARD_TEMPLATES_COMMENTS_ACTIVITY.md",
  "docs/qa/FLOWTASK_V58_23_3_BOARD_TEMPLATES_COMMENTS_ACTIVITY_QA.md",
  "docs/boards/FLOWTASK_BOARD_TEMPLATES_COMMENTS_ACTIVITY.md",
]) requireFile(rel);

for (const [rel, text] of [
  ["src/lib/release/version.ts", expectedVersion],
  ["src/lib/release/version.ts", "v58.23.3 Board Templates + Comments Activity"],
  ["src/components/boards/board-element.tsx", "onUpdateTableCell"],
  ["src/components/boards/board-element.tsx", "Tabla editable"],
  ["src/components/boards/properties-panel.tsx", "Tabla visual"],
  ["src/components/boards/properties-panel.tsx", "onRenameTableColumn"],
  ["src/components/boards/properties-panel.tsx", "onRemoveTableColumn"],
  ["src/components/boards/floating-format-toolbar.tsx", "onAddTableRow"],
  ["src/components/boards/floating-format-toolbar.tsx", "onAddTableColumn"],
  ["src/components/boards/board-page.tsx", "updateTableCell"],
  ["src/components/boards/board-page.tsx", "addTableColumn"],
  ["src/components/boards/board-page.tsx", "removeTableColumn"],
  ["src/lib/boards/board-serialization.ts", "columns: element.columns"],

  ["src/lib/boards/board-templates.ts", "BOARD_TEMPLATES"],
  ["src/lib/boards/board-templates.ts", "createTemplateElements"],
  ["src/components/boards/boards-home.tsx", "BOARD_TEMPLATES"],
  ["src/components/boards/board-comments-activity.tsx", "BoardCommentsActivity"],
  ["src/components/boards/board-page.tsx", "submitComment"],
  ["src/components/boards/board-page.tsx", "logBoardActivity"],
  ["src/lib/boards/board-types.ts", "VisualBoardComment"],
  ["src/lib/boards/board-serialization.ts", "mapBoardCommentRow"],
  ["supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql", "create table if not exists public.visual_board_comments"],
  ["supabase/migrations/0046_v58_23_3_board_templates_comments_activity.sql", "visual_board_elements_type_check"],
  ["package-lock.json", expectedVersion],
]) requireIncludes(rel, text);

if (failures.length) {
  console.error("[verify:v58.23.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.23.3] OK — Board templates, comments and activity aligned.");
