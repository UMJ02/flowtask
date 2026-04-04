import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredPaths = [
  "src/components/dashboard/interactive-dashboard-board.tsx",
  "docs/release/V58_5_UX_UI_POLISH_BOARD_STABILIZATION.md",
  "scripts/board-stabilization-check.mjs",
  "scripts/verify-v58.5.mjs",
  ".env.example",
  "README.md",
];

const forbiddenAtRoot = ["node_modules", ".next", ".git", ".env", ".env.local", "__MACOSX", ".DS_Store", "tsconfig.tsbuildinfo"];

const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
const forbidden = forbiddenAtRoot.filter((name) => fs.existsSync(path.join(root, name)));

if (missing.length || forbidden.length) {
  console.error("[verify-v58.5] Repo verification failed.");
  if (missing.length) console.error("Missing required paths:", missing.join(", "));
  if (forbidden.length) console.error("Forbidden root items detected:", forbidden.join(", "));
  process.exit(1);
}

console.log("[verify-v58.5] OK — UX/UI polish + board stabilization base limpia y lista para continuar.");
