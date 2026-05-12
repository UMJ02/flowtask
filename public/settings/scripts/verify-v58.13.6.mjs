import fs from "node:fs";

const required = [
  "src/app/(app)/app/projects/page.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/components/workspace/workspace-home.tsx",
  "src/app/(app)/app/tasks/page.tsx",
  "src/components/tasks/task-form.tsx",
  "src/app/(public)/page.tsx",
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("[verify:v58.13.6] Missing files:", missing.join(", "));
  process.exit(1);
}

const projects = fs.readFileSync("src/app/(app)/app/projects/page.tsx", "utf8");
const checks = [
  ["projects title", projects.includes("Proyectos")],
  ["projects stats", projects.includes("Total proyectos") && projects.includes("Completados")],
  ["projects table", projects.includes("ProjectRow") && projects.includes("ProjectProgressBar")],
  ["projects premium tokens", projects.includes("#F7F9FC") || projects.includes("#050B18") || projects.includes("#16C784")],
  ["new project route kept", projects.includes("projectNewRoute")],
  ["project detail route kept", projects.includes("projectDetailRoute")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[verify:v58.13.6] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log("[verify:v58.13.6] OK — Projects List PRO aligned.");
