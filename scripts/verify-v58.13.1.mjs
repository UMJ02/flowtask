import fs from "node:fs";

const required = [
  "src/components/workspace/workspace-home.tsx",
  "src/app/(app)/app/board/page.tsx",
  "src/app/(app)/app/dashboard/page.tsx",
  "src/components/layout/app-sidebar.tsx",
  "src/components/layout/nav-links.ts",
  "supabase/migrations/0038_v58_12_6_database_sanitization_foundation.sql",
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("[verify:v58.13.1] Missing files:", missing.join(", "));
  process.exit(1);
}

const workspace = fs.readFileSync("src/components/workspace/workspace-home.tsx", "utf8");
const sidebar = fs.readFileSync("src/components/layout/nav-links.ts", "utf8") + fs.readFileSync("src/components/layout/app-sidebar.tsx", "utf8");
const board = fs.readFileSync("src/app/(app)/app/board/page.tsx", "utf8");
const dashboard = fs.readFileSync("src/app/(app)/app/dashboard/page.tsx", "utf8");

const checks = [
  ["workspace radar hero", workspace.includes("RADAR INTELIGENTE") || workspace.includes("Radar inteligente")],
  ["workspace flow section", workspace.includes("Mi flujo de trabajo")],
  ["workspace quick widgets", workspace.includes("Notas rápidas") && workspace.includes("Tarea rápida")],
  ["dashboard renders WorkspaceHome", dashboard.includes("WorkspaceHome")],
  ["sidebar keeps Workspace", sidebar.includes("Workspace")],
  ["sidebar removes Pizarra", !sidebar.includes("Pizarra")],
  ["board redirects to dashboard workspace", board.includes("redirect") && board.includes("/app/dashboard")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[verify:v58.13.1] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log("[verify:v58.13.1] OK — Workspace v2 PRO aligned.");
