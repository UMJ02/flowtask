#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${rel}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function requireIncludes(rel, text, label = `${rel} must include ${text}`) {
  const content = read(rel);
  if (content && !content.includes(text)) failures.push(label);
}

function requireNotIncludes(rel, text, label = `${rel} must not include ${text}`) {
  const content = read(rel);
  if (content && content.includes(text)) failures.push(label);
}

const pkg = JSON.parse(read("package.json") || "{}");
const scripts = pkg.scripts ?? {};

if (pkg.version !== "58.21.1-user-language-interaction-cleanup") failures.push("package.json must use v58.21.1 package version");
if (scripts["verify:current"] !== "npm run verify:v58.21.1") failures.push("verify:current must target verify:v58.21.1");
if (scripts["verify:v58.21.1"] !== "node scripts/verify-v58.21.1.mjs") failures.push("verify:v58.21.1 must target scripts/verify-v58.21.1.mjs");

requireIncludes("package-lock.json", "58.21.1-user-language-interaction-cleanup", "package-lock.json must include v58.21.1 package version");
requireIncludes("src/lib/release/version.ts", "58.21.1-user-language-interaction-cleanup", "runtime version must export v58.21.1");
requireIncludes("src/lib/release/version.ts", "v58.21.1 User Language + Interaction Cleanup", "runtime release name must be v58.21.1");
requireIncludes("src/components/tasks/task-form.tsx", "Crea una tarea clara para que tu equipo sepa qué hacer", "Task create header must use user-friendly copy");
requireIncludes("src/components/tasks/task-form.tsx", "Próximo seguimiento: podrás definirlo después", "Task create must keep check-in as guided non-persistent copy");
requireIncludes("src/components/projects/project-form.tsx", "Este formulario guarda solo la información necesaria", "Project create sidebar must use user-friendly protected-field copy");
requireIncludes("src/components/projects/project-hero-inline-editor.tsx", "Editando proyecto", "Project inline editor must use user-facing edit label");
requireIncludes("src/components/projects/project-hero-inline-editor.tsx", "Sin salir de esta vista", "Project inline editor must explain same-page editing");
requireIncludes("src/components/projects/project-detail-pro.tsx", "Planificación", "Project tabs must include Planificación");
requireNotIncludes("src/components/projects/project-detail-pro.tsx", "Builder", "Project tabs must not expose Builder label");
requireNotIncludes("src/components/projects/project-detail-pro.tsx", "Prioridad</p>", "Project detail must not show fake project priority");
requireIncludes("docs/release/V58_21_1_USER_LANGUAGE_INTERACTION_CLEANUP.md", "User Language + Interaction Cleanup", "release notes must exist");
requireIncludes("docs/qa/FLOWTASK_V58_21_1_USER_LANGUAGE_INTERACTION_QA.md", "QA de lenguaje", "QA doc must exist");

if (failures.length) {
  console.error("[verify:v58.21.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.1] OK — User Language + Interaction Cleanup aligned.");
