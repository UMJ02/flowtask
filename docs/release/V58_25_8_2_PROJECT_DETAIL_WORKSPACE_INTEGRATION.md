# v58.25.8.2 — Project Detail Workspace Integration

## Objetivo

Conectar el detalle de proyecto y la lista de proyectos con la nueva experiencia Workspace-First sin reemplazar las rutas actuales.

Esta versión permite abrir cualquier proyecto real directamente en:

```txt
/app/workspace?projectId=ID&view=list
/app/workspace?projectId=ID&view=board
/app/workspace?projectId=ID&view=timeline
/app/workspace?projectId=ID&view=table
/app/workspace?projectId=ID&view=canvas
/app/workspace?projectId=ID&view=reports
```

## Base

- Base directa: `v58.25.8.1 — Workspace Real Data Hardening`.
- Mantiene `/app/projects/[id]` como detalle clásico.
- Mantiene `/app/projects` como listado clásico.
- No agrega migraciones.
- No instala dependencias.
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.

## Cambios técnicos

### Rutas de navegación Workspace

Se agregan helpers en `src/lib/navigation/routes.ts`:

- `workspaceRoute(query)`
- `workspaceProjectRoute(id, view, extraQuery)`

Esto evita armar URLs manuales y estandariza el paso de `projectId` y `view`.

### Detalle de proyecto integrado

`src/components/projects/project-detail-pro.tsx` ahora incluye:

- CTA principal `Abrir workspace` dentro del hero del proyecto.
- Bloque `Workspace integrado` debajo de las tabs del detalle.
- Accesos directos a vistas: Board, Timeline, Tabla, Canvas y Reportes.
- Acción rápida lateral que abre las tareas del proyecto dentro del Workspace.

### Lista de proyectos integrada

`src/app/(app)/app/projects/page.tsx` ahora incluye:

- Botón superior `Vista Workspace`.
- Acción por fila para abrir el proyecto en `/app/workspace?projectId=...&view=list`.
- Se conserva el botón clásico de ver detalle y editar proyecto.

### Seguridad arquitectónica

La integración se apoya en el hardening de v58.25.8.1:

- Si el `projectId` no pertenece al workspace/espacio activo, `/app/workspace` muestra alerta y no enseña datos cruzados.
- No se crean tablas `workspace_spaces` ni `project_views`.
- No se cambia la lógica de Supabase/RLS.

## Archivos principales

- `src/lib/navigation/routes.ts`
- `src/components/projects/project-detail-pro.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `scripts/verify-v58.25.8.2.mjs`
- `docs/release/V58_25_8_2_PROJECT_DETAIL_WORKSPACE_INTEGRATION.md`
- `docs/qa/FLOWTASK_V58_25_8_2_PROJECT_DETAIL_WORKSPACE_INTEGRATION_QA.md`

## Validación esperada

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Resultado

Los proyectos ya no quedan aislados del nuevo Workspace System. El usuario puede seguir usando el detalle tradicional, pero también puede abrir el mismo proyecto dentro de las views dinámicas tipo ClickUp/Notion/Asana.
