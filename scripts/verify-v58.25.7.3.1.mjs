#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.7.3.1-boards-readiness-alignment-fix";
const expectedRelease = "v58.25.7.3.1 Boards Readiness Alignment Fix";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.3.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.3.1") failures.push("verify:current must target verify:v58.25.7.3.1");
if ((pkg.scripts ?? {})["verify:v58.25.7.3.1"] !== "node scripts/verify-v58.25.7.3.1.mjs") failures.push("verify:v58.25.7.3.1 script missing");

requireFile("public/boards-home/nuevo_proyecto.png");
requireFile("docs/release/V58_25_7_3_1_BOARDS_READINESS_ALIGNMENT_FIX.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_3_1_BOARDS_READINESS_ALIGNMENT_FIX_QA.md");
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/pizarra_blanco.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/diagrama_fujo.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/plan_proyecto.png");
requireIncludes("src/components/boards/boards-home.tsx", "/boards-home/nuevo_proyecto.png");
requireNotIncludes("src/components/boards/boards-home.tsx", "<HeroIllustration />");

requireIncludes("scripts/build-deploy-readiness.mjs", expectedVersion);
requireIncludes("scripts/deploy-production-readiness.mjs", expectedVersion);
requireIncludes("src/app/globals.css", "v58.25.7.3 — Boards hero remove + template icons restore");

if (failures.length) {
  console.error("[verify:v58.25.7.3.1] FAIL");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("[verify:v58.25.7.3.1] OK — boards readiness alignment fix aligned.");
