# v58.25.8.9 — Workspace Activity Timeline + Files Upload Entry Polish

## Objetivo

Pulir la experiencia Workspace-First agregando una línea de actividad más clara y un punto de subida de archivos directo desde la vista Archivos, sin crear tablas nuevas ni reemplazar los módulos existentes.

## Base

- Base inmediata: v58.25.8.8 — Workspace Project Activity + Files Context Polish.
- Mantiene `/app/workspace` como shell full-screen dedicado.
- Mantiene datos reales desde `tasks`, `projects`, `visual_boards`, `activity_logs` y `attachments`.

## Cambios principales

- Nuevo `WorkspaceActivityTimeline` para mostrar actividad agrupada por día.
- Right Panel cambia de listado plano a línea de actividad compacta.
- Nuevo `WorkspaceFilesUploadEntry` en la vista Archivos.
- Upload real a Supabase Storage bucket `attachments`.
- Insert real en tabla `attachments` vinculado al proyecto activo.
- Registro de actividad `attachment_uploaded` desde el upload entry.
- Selector de proyecto cuando la vista no está filtrada por proyecto.
- Bloqueo automático al proyecto activo cuando `context.projectId` existe.
- CSS nuevo para timeline y upload entry.

## Archivos clave

- `src/components/workspace-system/workspace-activity-timeline.tsx`
- `src/components/workspace-system/workspace-files-upload-entry.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/views/files-view.tsx`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/app/globals.css`
- `scripts/verify-v58.25.8.9.mjs`

## No se tocó

- No se agregaron migraciones.
- No se crearon `workspace_spaces` ni `project_views`.
- No se reemplazó `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No se duplicó `BoardPage`.
- No se tocó `safe_delete_visual_board`.
- No se agregaron dependencias nuevas.

## Validación esperada

```bash
npm run verify:current
npm run typecheck
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run board:stability
npm run client:readiness:check
npm run deploy:readiness
npm run deploy:production:ready
npm run build:preflight
```

## QA manual

1. Entrar a `/app/workspace?view=files`.
2. Confirmar que aparece el bloque “Subir archivo al workspace”.
3. Con proyecto activo, confirmar que el selector queda bloqueado al proyecto.
4. Sin proyecto activo, seleccionar un proyecto destino.
5. Subir un archivo y confirmar que aparece en Adjuntos recientes.
6. Confirmar que se registra actividad `attachment_uploaded`.
7. Confirmar que el panel derecho muestra línea de actividad por día.
8. Confirmar que no se mezclan datos entre proyecto/espacio/workspace.
