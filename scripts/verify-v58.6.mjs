import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredPaths = [
  "src/components/dashboard/interactive-dashboard-board.tsx",
  "docs/release/V58_6_FUNCTIONAL_CLOSEOUT_CLIENT_READINESS.md",
  "scripts/client-readiness-check.mjs",
  "scripts/verify-v58.6.mjs",
  ".env.example",
  "README.md",
];

const forbiddenAtRoot = ["node_modules", ".next", ".git", ".env", ".env.local", "__MACOSX", ".DS_Store", "tsconfig.tsbuildinfo"];

const missing = requiredPaths.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));
const forbidden = forbiddenAtRoot.filter((name) => fs.existsSync(path.join(root, name)));

if (missing.length || forbidden.length) {
  console.error("[verify-v58.6] Repo verification failed.");
  if (missing.length) console.error("Missing required paths:", missing.join(", "));
  if (forbidden.length) console.error("Forbidden root items detected:", forbidden.join(", "));
  process.exit(1);
}

console.log("[verify-v58.6] OK — functional closeout + client readiness base limpia y lista para continuar.");
