# QA — v58.25.8.7 Workspace Views Real Interaction Polish

## Validación técnica

- [ ] `package.json` usa `58.25.8.7-workspace-views-real-interaction-polish`.
- [ ] `verify:current` apunta a `verify:v58.25.8.7`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.7.
- [ ] `scripts/verify-v58.25.8.7.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.7.
- [ ] `npm run typecheck` pasa.
- [ ] `npm run build:preflight` pasa con `.env` real.
- [ ] `npm run build` pasa con Node 20.

## QA funcional Workspace

- [ ] `/app/workspace?view=list` carga con datos reales.
- [ ] En Lista se puede cambiar estado de una tarea desde el selector inline.
- [ ] En Lista se puede cambiar prioridad desde el selector inline.
- [ ] En Lista se puede cambiar fecha límite desde el input inline.
- [ ] Después de editar, la vista refresca sin salir del Workspace.
- [ ] Si RLS bloquea una acción, se muestra mensaje de error inline.
- [ ] `/app/workspace?view=board` permite mover tareas con acciones rápidas.
- [ ] `/app/workspace?view=table` permite edición rápida de estado, prioridad y fecha.
- [ ] Los cambios respetan filtros activos de espacio/proyecto/status.
- [ ] No se mezclan datos entre workspace personal y organización.

## QA visual

- [ ] Los controles inline no rompen el layout desktop.
- [ ] Los controles inline se apilan correctamente en mobile.
- [ ] Las tarjetas de Board mantienen densidad compacta.
- [ ] El feedback de actualización no usa `alert` nativo.
- [ ] La estética mantiene el sistema Workspace-First: #F6F8FB, #FFFFFF, #E5EAF1, #0F172A, #64748B, #16C784.

## QA de seguridad/base de datos

- [ ] No existen migraciones nuevas en esta versión.
- [ ] No se crean tablas `workspace_spaces` ni `project_views`.
- [ ] `safe_delete_visual_board` no fue modificado.
- [ ] La actualización de tareas depende de RLS existente en Supabase.
