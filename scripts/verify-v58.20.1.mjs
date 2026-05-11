#!/usr/bin/env node
import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const workspace = read('src/components/tasks/task-workspace-inline.tsx');
const activityLog = read('src/lib/activity/log-client.ts');
const checks = [];
function check(name, ok, hint) { checks.push({ name, ok: Boolean(ok), hint }); }
check('package version is v58.20.1', pkg.version === '58.20.1-task-workspace-visual-polish-interaction-qa', 'package.json version must identify v58.20.1');
check('verify current points to v58.20.1', pkg.scripts?.['verify:current'] === 'npm run verify:v58.20.1', 'verify:current must run the new verifier');
check('task status options match Supabase contract', workspace.includes('const statusOptions = ["en_proceso", "en_espera", "concluido"] as const;'), 'Task workspace must only expose valid task statuses');
check('invalid project-only statuses removed', !workspace.includes('"completado"') && !workspace.includes('"vencida"'), 'Task workspace must not expose completado/vencida');
check('manual save copy is honest', workspace.includes('Cambios guardados') && workspace.includes('Guardando cambios…') && !workspace.includes('Guardado automáticamente'), 'Save badge must not claim autosave without real autosave');
check('cancel edit restores original form', workspace.includes('function cancelEdit()') && workspace.includes('setForm(initialForm)'), 'Cancel should revert local edits');
check('fake tabs removed', workspace.includes('Feed operativo') && !workspace.includes('Actividad</button>') && !workspace.includes('Comentarios</button>'), 'Feed must be a unified operational timeline');
check('fake action icons removed', !workspace.includes('Star') && !workspace.includes('MoreHorizontal') && !workspace.includes('IconButton'), 'Favorite/more placeholder actions must be removed');
check('share action is functional', workspace.includes('copyTaskLink') && workspace.includes('navigator.clipboard.writeText'), 'Share should copy the task URL');
check('sidebar chevron removed', !workspace.includes('ChevronDown'), 'Sidebar should not show a false collapse chevron');
check('responsible fake add removed', !workspace.includes('Agregar responsable</button>'), 'Add responsible button must not appear unless connected to a real flow');
check('activity logs include task_id column for task events', activityLog.includes('context.task_id = payload.entityId') && activityLog.includes('metadata.task_id = metadata.task_id ?? payload.entityId'), 'logActivity must enrich task events with relational task_id');
const failed = checks.filter(c => !c.ok);
if (failed.length) { console.error('[verify:v58.20.1] FAILED'); for (const c of failed) console.error(`- ${c.name}: ${c.hint}`); process.exit(1); }
console.log('[verify:v58.20.1] OK — Task Workspace Visual Polish + Interaction QA aligned:');
for (const c of checks) console.log(`- ${c.name}`);
