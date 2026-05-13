# QA — v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish

## Release checks

- [ ] `package.json` usa `58.25.8.9-workspace-activity-timeline-files-upload-entry-polish`.
- [ ] `verify:current` apunta a `verify:v58.25.8.9`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.9.
- [ ] `scripts/verify-v58.25.8.9.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.9.

## Workspace files

- [ ] `/app/workspace?view=files` carga sin romper el shell full-screen.
- [ ] La vista muestra adjuntos, imágenes, documentos y pizarras.
- [ ] El upload entry aparece antes de los listados.
- [ ] Si hay `projectId`, el upload queda bloqueado a ese proyecto.
- [ ] Si no hay `projectId`, permite elegir proyecto destino.
- [ ] El upload guarda en Storage `attachments`.
- [ ] El upload inserta fila en tabla `attachments`.
- [ ] El upload refresca la vista sin navegación pesada.

## Activity timeline

- [ ] El panel derecho muestra “Línea de actividad”.
- [ ] La actividad se agrupa por día.
- [ ] Los íconos cambian por tipo de acción.
- [ ] Si no hay actividad, muestra estado vacío profesional.
- [ ] Los uploads nuevos aparecen como actividad reciente.

## Seguridad / alcance

- [ ] No hay migraciones nuevas.
- [ ] No se usan `workspace_spaces` ni `project_views`.
- [ ] No se reemplazan módulos existentes.
- [ ] No se toca `safe_delete_visual_board`.
- [ ] No se instalan dependencias nuevas.
