import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'V_Report');
const outFile = path.join(outDir, 'BUG_TRACKING_RUN_v9.md');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = `# Bug Tracking Run v9

Generated: ${new Date().toISOString()}

## Instrucciones
Documenta aquí cada bug encontrado durante la validación local o en entorno conectado a Supabase.

## Tabla de bugs
| ID | Módulo | Flujo | Severidad | Estado | Descripción | Reproducción | Resultado esperado |
|---|---|---|---|---|---|---|---|
| BUG-001 | Auth | Login | Alta | Abierto |  |  |  |
| BUG-002 | Dashboard | Primera carga | Media | Abierto |  |  |  |
| BUG-003 | Tasks | Crear/editar | Alta | Abierto |  |  |  |
| BUG-004 | Projects | Crear/editar | Alta | Abierto |  |  |  |
| BUG-005 | Notifications | Carga | Media | Abierto |  |  |  |

## Nota
Conserva únicamente los bugs reales; elimina las filas que no apliquen.
`;

fs.writeFileSync(outFile, content, 'utf8');
console.log(`[bugs-template] Wrote ${path.relative(root, outFile)}`);
