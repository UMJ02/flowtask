#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const scanDirs = ["src/app", "src/components"];
const allowedLargePatterns = [
  /auth/i,
  /landing/i,
  /public/i,
  /hero/i,
  /onboarding/i,
  /marketing/i,
  /properties-panel\.tsx$/,
  /board-minimap\.tsx$/,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file);
}

const files = scanDirs.flatMap((dir) => walk(path.join(root, dir)));

for (const file of files) {
  const relative = rel(file);
  const content = fs.readFileSync(file, "utf8");
  const allowedLarge = allowedLargePatterns.some((pattern) => pattern.test(relative));

  if (!allowedLarge && /rounded-\[(3[0-9]|[4-9][0-9])px\]/.test(content)) {
    warnings.push(`${relative}: large custom radius detected`);
  }

  if (!allowedLarge && /(p[xy]?|px|py)-([8-9]|1[0-9])\b/.test(content)) {
    warnings.push(`${relative}: large Tailwind padding detected`);
  }

  if (!allowedLarge && /text-\[(3[0-9]|[4-9][0-9])px\]/.test(content)) {
    warnings.push(`${relative}: large custom text size detected`);
  }

  if (!allowedLarge && /h-(14|16|20)\b/.test(content)) {
    warnings.push(`${relative}: large fixed height control detected`);
  }

  if (/shadow-\[0_(3[0-9]|[4-9][0-9])px/.test(content)) {
    warnings.push(`${relative}: heavy custom shadow detected`);
  }
}

const globals = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
for (const token of [
  "--ft-density-page-gap",
  "--ft-density-card-padding",
  "--ft-density-control-height",
  "--ft-density-row-height",
  "--ft-density-title-page",
  "v58.25.7 — Global Productivity Density System + UI Scale Refactor",
]) {
  if (!globals.includes(token)) failures.push(`Missing density token/marker in globals.css: ${token}`);
}

const strict = process.argv.includes("--strict");

if (warnings.length) {
  console.warn("[density-guard] WARN — visual density review items:");
  for (const warning of warnings.slice(0, 80)) console.warn(`- ${warning}`);
  if (warnings.length > 80) console.warn(`- ...and ${warnings.length - 80} more`);
}

if (strict && warnings.length > 80) {
  failures.push(`Strict density guard allows up to 80 warnings; found ${warnings.length}.`);
}

if (failures.length) {
  console.error("[density-guard] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(strict ? "[density-guard:strict] OK — density debt is inside accepted threshold." : "[density-guard] OK — global density tokens and guardrails are present.");
