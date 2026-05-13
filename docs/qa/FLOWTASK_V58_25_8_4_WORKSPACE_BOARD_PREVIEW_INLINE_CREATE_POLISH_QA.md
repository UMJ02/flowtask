# QA — v58.25.8.4 Workspace Board Preview + Inline Create Polish

## Checklist técnico
- [ ] `package.json` usa `58.25.8.4-workspace-board-preview-inline-create-polish`.
- [ ] `verify:current` apunta a `verify:v58.25.8.4`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.4.
- [ ] `scripts/verify-v58.25.8.4.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.4.

## QA Workspace
- [ ] `/app/workspace` carga sin romper el shell actual.
- [ ] `+ Nueva tarea` abre formulario inline.
- [ ] El formulario permite título, proyecto, prioridad y fecha.
- [ ] Crear tarea sin proyecto crea tarea en el workspace activo.
- [ ] Crear tarea con proyecto conserva `project_id`.
- [ ] En organización activa, la tarea conserva `organization_id`.
- [ ] Después de crear, la pantalla refresca datos reales.

## QA Canvas / Boards
- [ ] `view=canvas` muestra previews visuales de pizarras reales.
- [ ] Si la pizarra tiene `thumbnailUrl`, se usa como preview.
- [ ] Si no tiene thumbnail, se renderiza preview generado sin romper diseño.
- [ ] Cada preview abre `/app/boards/[id]` usando el editor existente.
- [ ] No se duplica ni se monta `BoardPage` dentro del Workspace.

## QA no regresión
- [ ] `/app/tasks` sigue cargando.
- [ ] `/app/projects` sigue cargando.
- [ ] `/app/boards` sigue cargando.
- [ ] `/app/reports` sigue cargando.
- [ ] No se crearon tablas nuevas.
- [ ] No se agregó dependencia nueva.
- [ ] No se tocó `safe_delete_visual_board`.
