#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
const allowed = ["58.28.12-workspace-pro-home-hero-solid-card-colors", "58.28.14-workspace-pro-component-split-runtime-slimdown"];
const allowedVerify = ["npm run verify:v58.28.12", "npm run verify:v58.28.14"];
if (!allowed.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerify.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.12+");
if (!allowed.some((item) => version.includes(item))) failures.push("release version marker missing");
if (!css.includes("v58.28.12 — Workspace Pro Home Hero + Solid Card Colors")) failures.push("CSS marker missing");
if (!css.includes("min-height: 10.75rem") || !css.includes("padding: clamp(1.65rem")) failures.push("Home hero spacing/alignment override missing");
if (!css.includes("border-top-color: #2563eb") || !css.includes("border-top-color: #f59e0b") || !css.includes("border-top-color: #7c3aed") || !css.includes("border-top-color: #10b981")) failures.push("Solid board color distribution missing");
if (!page.includes(`CleanCard
            title="Tareas importantes"
            className="ws-pro-card-tone-blue"`)) failures.push("Tareas importantes must use solid blue tone");
if (!page.includes(`CleanCard
            title="Próximos vencimientos"
            className="ws-pro-card-tone-amber"`)) failures.push("Próximos vencimientos must use solid amber tone");
if (!page.includes(`CleanCard title="Proyectos activos" className="ws-pro-card-tone-violet"`)) failures.push("Proyectos activos must use solid violet tone");
if (!page.includes(`CleanCard title="Recursos" className="ws-pro-card-tone-emerald"`)) failures.push("Recursos must use solid emerald tone");
if (failures.length) { console.error("[workspace:home-solid-cards:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:home-solid-cards:ready] OK — Home hero and solid card color system aligned.");
