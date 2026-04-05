#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [
  ["package.json", '"verify:v58.10.5"'],
  ["package.json", '"ops:check"'],
  ["src/app/error.tsx", "useErrorLogger"],
  ["src/components/auth/login-form.tsx", 'eventName: "login"'],
  ["src/components/projects/project-form.tsx", 'eventName: isEdit ? "update_project" : "create_project"'],
  ["src/components/tasks/task-form.tsx", 'eventName: isEdit ? "update_task" : "create_task"'],
];

const failures = [];
for (const [rel, token] of checks) {
  const content = fs.readFileSync(path.join(root, rel), "utf8");
  if (!content.includes(token)) failures.push(`${rel} missing ${token}`);
}

if (failures.length) {
  console.error("[ops-check] Failures:");
  failures.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log("[ops-check] OK");
