#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.6.6.1-boards-properties-locked-typecheck-fix";

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text){ if(read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/verify-v58.25.6.6.1.mjs",
  "docs/release/V58_25_6_6_1_BOARDS_PROPERTIES_LOCKED_TYPECHECK_FIX.md",
  "docs/qa/FLOWTASK_V58_25_6_6_1_BOARDS_PROPERTIES_LOCKED_TYPECHECK_FIX_QA.md",
  "src/components/boards/board-element.tsx",
  "src/components/boards/board-share-view.tsx",
  "src/lib/boards/table-tools.ts",
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.6.6.1") failures.push("verify:current must target verify:v58.25.6.6.1");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/board-element.tsx", "const table = element;");
requireIncludes("src/components/boards/board-share-view.tsx", "onResolveTableFormula");
requireIncludes("src/lib/boards/table-tools.ts", 'if (selection.type === "row") return selection.rowId === id;');
requireNotIncludes("src/components/boards/board-element.tsx", "handleClick(event);");

if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.25.6.5.1 Boards table typecheck readiness aligned.");
