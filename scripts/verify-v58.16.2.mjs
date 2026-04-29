import fs from "node:fs";
const files = [
  "src/components/projects/project-detail-pro.tsx",
  "src/components/projects/project-planning-timeline.tsx",
  "src/components/projects/project-inline-tasks.tsx"
];
for (const file of files) { if (!fs.existsSync(file)) throw new Error(`[verify:v58.16.2] Missing ${file}`); }
const detail = fs.readFileSync(files[0], "utf8");
const timeline = fs.readFileSync(files[1], "utf8");
const inline = fs.readFileSync(files[2], "utf8");
const checks = [
  [detail.includes("bg-gradient-to-l from-[#ECFDF5]"), "premium hero gradient"],
  [detail.includes("AvatarStack"), "hero avatar stack"],
  [detail.includes("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"), "5 KPI cards row"],
  [timeline.includes("xl:grid-cols-[minmax(0,1fr)_320px]"), "timeline builder panel right grid"],
  [timeline.includes("Guardar vista") && timeline.includes("Exportar"), "timeline actions"],
  [timeline.includes("bg-[#ECFDF5]") && timeline.includes("Builder"), "builder toggle separated"],
  [inline.includes("Tareas internas"), "internal project tasks"],
  [inline.includes("project_id: project.id"), "project-scoped tasks creation"],
];
const failed = checks.filter(([ok]) => !ok);
if (failed.length) { console.error(failed.map(([,label]) => `- ${label}`).join("\n")); process.exit(1); }
console.log("[verify:v58.16.2] OK — Project detail premium design and inline tasks aligned.");
