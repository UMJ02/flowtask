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
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '58.25.7.3-boards-hero-remove-template-icons-restore') failures.push('package version must be v58.25.7.3');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.7.3') failures.push('verify:current must target verify:v58.25.7.3');
requireFile('public/boards-home/nuevo_proyecto.png');
requireIncludes('src/components/boards/boards-home.tsx', '/boards-home/pizarra_blanco.png');
requireIncludes('src/components/boards/boards-home.tsx', '/boards-home/diagrama_fujo.png');
requireIncludes('src/components/boards/boards-home.tsx', '/boards-home/plan_proyecto.png');
requireIncludes('src/components/boards/boards-home.tsx', '/boards-home/nuevo_proyecto.png');
requireNotIncludes('src/components/boards/boards-home.tsx', '<HeroIllustration />');
requireIncludes('src/app/globals.css', 'v58.25.7.3 — Boards hero remove + template icons restore');
if (failures.length) { console.error('[verify:v58.25.7.3] FAIL'); failures.forEach(f => console.error('- ' + f)); process.exit(1); }
console.log('[verify:v58.25.7.3] OK — boards hero removal and template icons restore aligned.');
