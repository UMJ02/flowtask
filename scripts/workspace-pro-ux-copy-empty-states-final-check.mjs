import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const files = [
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-spaces-manager.tsx",
  "src/components/workspace-system/workspace-quick-create.tsx",
  "src/components/workspace-system/workspace-sidebar-pro.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx"
];
const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const allowedVersions = [
  "58.28.19-ux-copy-empty-states-final",
  "58.28.20-mobile-responsive-final-pass",
  "58.28.21-supabase-rls-client-readiness-final",
];
const allowedVerifyTargets = [
  "npm run verify:v58.28.19",
  "npm run verify:v58.28.20",
  "npm run verify:v58.28.21",
];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active v58.28.19+ verify script");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:final-copy:ready")) failures.push("build:preflight must include workspace:final-copy:ready");
const versionText = fs.readFileSync("src/lib/release/version.ts", "utf8");
if (!versionText.includes("APP_RELEASE_STAGE")) failures.push("version.ts must export APP_RELEASE_STAGE");

const requiredCopy = [
  "Todavía no hay tareas",
  "Crear tarea",
  "Aún no hay proyectos",
  "Crear proyecto",
  "El board está vacío",
  "Sin fechas para mostrar",
  "La tabla está vacía",
  "Aún no hay pizarras",
  "Aún no hay archivos",
  "Todo el trabajo",
  "Estado del espacio",
  "Revisión final"
];
for (const copy of requiredCopy) {
  if (!text.includes(copy)) failures.push(`Missing final user copy: ${copy}`);
}

const blockedCopy = [
  "Workspace Health",
  "Client QA",
  "Persistencia workspace",
  "space links",
  "Estado reportes",
  "Archivos del workspace",
  "Todo el workspace",
  "No hay tareas visibles",
  "No hay proyectos visibles",
  "No hay tareas para el board",
  "Tabla sin registros",
  "Timeline sin fechas",
  "Actualizando vista",
  "source of truth",
  "sync surface",
  "readiness",
];
for (const copy of blockedCopy) {
  if (text.includes(copy)) failures.push(`Technical or legacy copy still present: ${copy}`);
}

if (failures.length) {
  console.error("[workspace:final-copy:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:final-copy:ready] OK — final UX copy and empty states are user-facing.");
