import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const now = new Date().toISOString();
const outDir = path.join(process.cwd(), 'docs', 'preflight');
mkdirSync(outDir, { recursive: true });

const content = `# FlowTask Preflight Report\n\nGenerado: ${now}\n\n## Checklist sugerido\n- Node correcto: npm run validate:node\n- Variables correctas: npm run validate:env\n- Runtime limpio: npm run runtime:check\n- TypeScript limpio: npm run typecheck\n- Build limpio: npm run build\n\n## Notas\n- Este archivo se genera como soporte operativo previo a deploy.\n- No sustituye QA funcional ni validación visual en Vercel.\n`;

writeFileSync(path.join(outDir, 'PREVIEW_PREFLIGHT_REPORT.md'), content);
console.log('[preflight-report] OK');
