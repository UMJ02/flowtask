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

const expectedVersion = "58.25.8.3-workspace-canvas-boards-integration";
const expectedRelease = "v58.25.8.3 Workspace Canvas/Boards Integration";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8.3 workspace canvas/boards integration");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8.3") failures.push("verify:current must target verify:v58.25.8.3");
if ((pkg.scripts ?? {})["verify:v58.25.8.3"] !== "node scripts/verify-v58.25.8.3.mjs") failures.push("verify:v58.25.8.3 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/components/workspace-system/views/canvas-view.tsx");
requireFile("src/components/workspace-system/views/files-view.tsx");
requireFile("src/lib/workspace-system/server-data.ts");
requireFile("src/lib/navigation/routes.ts");

requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceBoardSummary");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceBoards");
requireIncludes("src/lib/workspace-system/server-data.ts", "visual_boards");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "workspace:getBoards");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "boards: WorkspaceBoardSummary[]");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "<CanvasView tasks={tasks} boards={boards} context={context} />");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "Pizarras del workspace");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "boardRoute(board.id)");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "boards: WorkspaceBoardSummary[]");
requireIncludes("src/lib/navigation/routes.ts", "boardRoute");

requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "workspace_spaces");
requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "project_views");
requireNotIncludes("src/components/workspace-system/views/canvas-view.tsx", "BoardPage(");

requireFile("docs/release/V58_25_8_3_WORKSPACE_CANVAS_BOARDS_INTEGRATION.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_3_WORKSPACE_CANVAS_BOARDS_INTEGRATION_QA.md");
requireIncludes("src/app/globals.css", "v58.25.8.3 Workspace Canvas/Boards Integration");

if (failures.length) {
  console.error("[verify:v58.25.8.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8.3] OK — Workspace Canvas/Boards integration, real visual_boards data and release metadata aligned.");
