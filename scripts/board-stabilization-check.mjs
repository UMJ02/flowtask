import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const boardFile = path.join(root, "src/components/dashboard/interactive-dashboard-board.tsx");
const text = fs.readFileSync(boardFile, "utf8");

const checks = [
  "flowtask.board.v586",
  "Refrescar datos",
  "Resetear vista",
  "Última sincronización",
  "Agenda del día",
  "favoriteTaskIds",
  "Tareas destacadas",
];

const missing = checks.filter((item) => !text.includes(item));
if (missing.length) {
  console.error(`[board-stabilization-check] Missing board markers: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("[board-stabilization-check] OK — board stabilization markers detected.");
