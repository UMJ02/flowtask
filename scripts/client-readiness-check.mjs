import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const boardFile = path.join(root, "src/components/dashboard/interactive-dashboard-board.tsx");
const text = fs.readFileSync(boardFile, "utf8");

const checks = [
  "flowtask.board.v586",
  "Agenda cliente",
  "Tareas destacadas",
  "Agregar a agenda",
  "client:readiness:check",
];

const missing = checks.filter((item) => !text.includes(item) && item !== "client:readiness:check");
if (!fs.existsSync(path.join(root, "scripts/client-readiness-check.mjs"))) missing.push("scripts/client-readiness-check.mjs");

if (missing.length) {
  console.error(`[client-readiness-check] Missing client readiness markers: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("[client-readiness-check] OK — client readiness markers detected.");
