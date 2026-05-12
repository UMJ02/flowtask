#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, 'V_Report');
const outFile = path.join(outDir, 'PREFLIGHT_REPORT_v9.md');
const now = new Date().toISOString();

const content = `# FlowTask V9 — Preflight Report\n\nGenerado: ${now}\n\n## Checklist sugerido\n- Node correcto (`npm run validate:node`)\n- Variables correctas (`npm run validate:env`)\n- Runtime limpio (`npm run runtime:check`)\n- TypeScript limpio (`npm run typecheck`)\n- Build limpio (`npm run build`)\n\n## Notas\n- Este archivo se genera como soporte operativo previo a deploy.\n- No sustituye QA funcional ni validación visual en Vercel.\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, content, 'utf8');
console.log(`[preflight-report] generado: ${path.relative(projectRoot, outFile)}`);
