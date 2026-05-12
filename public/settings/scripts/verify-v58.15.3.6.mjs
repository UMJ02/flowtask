import fs from "node:fs";

const required = [
  "src/components/tasks/task-form.tsx",
  "src/components/projects/project-form.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/components/clients/client-manager-panel.tsx",
  "src/lib/queries/projects.ts",
  "src/lib/queries/clients.ts",
  "supabase/migrations/0041_v58_15_3_5_project_client_media.sql",
  "src/lib/release/version.ts",
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("[verify:v58.15.3.6] Missing files:", missing.join(", "));
  process.exit(1);
}
const read = (file) => fs.readFileSync(file, "utf8");
const taskForm = read("src/components/tasks/task-form.tsx");
const projectForm = read("src/components/projects/project-form.tsx");
const clientManager = read("src/components/clients/client-manager-panel.tsx");
const projectsQuery = read("src/lib/queries/projects.ts");
const clientsQuery = read("src/lib/queries/clients.ts");
const migration = read("supabase/migrations/0041_v58_15_3_5_project_client_media.sql");
const release = read("src/lib/release/version.ts");

const checks = [
  ["release version aligned", release.includes("58.15.3.6-task-editor-width-alignment")],
  ["task editor uses wide canvas alignment", taskForm.includes("max-w-[1840px]") && taskForm.includes("2xl:px-10")],
  ["task editor has rotating tips", taskForm.includes("QUICK_TIPS") && taskForm.includes("setInterval") && taskForm.includes("6000")],
  ["task editor pastel sidebar", taskForm.includes('tone="green"') && taskForm.includes('tone="amber"') && taskForm.includes('tone="purple"') && taskForm.includes('tone="blue"')],
  ["project form image upload", projectForm.includes("Imagen del proyecto") && projectForm.includes("image_url") && projectForm.includes("storage.from(\"attachments\")")],
  ["project list/detail reads image", projectsQuery.includes("image_url")],
  ["client avatar upload", clientManager.includes("Foto del cliente") && clientManager.includes("avatar_url") && clientManager.includes("clientAvatarFile")],
  ["clients query reads avatar", clientsQuery.includes("avatar_url") && clientsQuery.includes("avatarUrl")],
  ["migration adds columns", migration.includes("projects") && migration.includes("image_url") && migration.includes("clients") && migration.includes("avatar_url")],
  ["no forbidden task db fields", !taskForm.includes("assignee_id") && !taskForm.includes("start_date") && !taskForm.includes("is_done") && !taskForm.includes("file_url")],
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[verify:v58.15.3.6] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}
console.log("[verify:v58.15.3.6] OK — Task editor premium width alignment + project/client media aligned.");
