#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [
  ["package.json", /"verify:current"\s*:/],
  ["package.json", /"ops:check"\s*:/],
  ["package.json", /"release:current"\s*:/],
  ["src/app/error.tsx", /useErrorLogger/],
  ["src/components/auth/login-form.tsx", /eventName:\s*['"]login['"]/],
  ["src/components/projects/project-form.tsx", /eventName:\s*isEdit\s*\?\s*['"]update_project['"]\s*:\s*['"]create_project['"]/],
  ["src/components/tasks/task-form.tsx", /eventName:\s*isEdit\s*\?\s*['"]update_task['"]\s*:\s*['"]create_task['"]/],
];

const failures = [];
for (const [rel, matcher] of checks) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`${rel} missing`);
    continue;
  }
  const content = fs.readFileSync(full, "utf8");
  if (!matcher.test(content)) failures.push(`${rel} missing ${matcher}`);
}

if (failures.length) {
  console.error("[ops-check] Failures:");
  failures.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log("[ops-check] OK — telemetry markers and release scripts are aligned.");
