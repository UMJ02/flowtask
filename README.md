# FlowTask — v58.25.9.1 Workspace Persistence UI + Saved Views Manager

Base: **v58.25.8.9 — Workspace Activity Timeline + Files Upload Entry Polish**

## Objetivo

Agregar la base de persistencia del Workspace System para guardar espacios y vistas por proyecto, manteniendo la experiencia Workspace-First ya conectada a datos reales.

## Cambios principales

- Mantiene migración `0056_v58_25_9_workspace_persistence_foundation.sql`.
- Agrega UI para guardar, renombrar, abrir, marcar default y eliminar `project_views`.
- Nueva tabla opcional: `workspace_spaces`.
- Nueva tabla opcional: `project_views`.
- Helpers server-safe: `getWorkspacePersistedSpaces()` y `getWorkspaceProjectViews()`.
- `/app/workspace` usa espacios persistidos cuando existen y mantiene fallback generado por datos reales.
- Tabs superiores muestran indicador de vista persistida cuando aplica.
- Panel derecho muestra bloque de Persistencia Workspace.
- RLS para modo personal y organización.

## Validación recomendada

```bash
npm install
npm run verify:current
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Nota

Esta versión introduce la base DB opcional para persistencia. No reemplaza rutas existentes, no duplica BoardPage y no toca `safe_delete_visual_board`.


## v58.25.9.3 — Workspace Saved Views Defaults + Filters Persistence

- Saved views now persist the operational state of `/app/workspace`, including status filter, grouping, sort and visible columns metadata.
- `savedViewId` can reopen a saved configuration without leaving the workspace.
- Default project views can be applied automatically when opening a project without an explicit `view` query.
- No new migration is required; this version uses `project_views.config` from migration `0056`.

## v58.25.9.2 — Workspace Persistence QA + Supabase Migration Guard

Esta versión agrega guardas de persistencia para que `/app/workspace` siga funcionando aunque la migración `0056_v58_25_9_workspace_persistence_foundation.sql` no se haya aplicado todavía o esté parcialmente disponible.

Comandos clave:

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

La persistencia Workspace usa `workspace_spaces` y `project_views` cuando están listas. Si no están listas, FlowTask mantiene fallback con espacios generados desde datos reales y bloquea escrituras de Saved Views con feedback profesional.


## v58.25.9.4 — Workspace Spaces Manager + Project Organization

- Agrega `workspace_space_projects` como capa opcional para asignar proyectos reales a espacios persistidos.
- `/app/workspace` ahora puede crear, renombrar, archivar espacios y organizar proyectos sin reemplazar rutas clásicas.
- Mantiene fallback con espacios generados si la migración 0057 no está disponible.

## v58.25.9.5 — Workspace Project Home Dashboard

Agrega la vista `Home` al Workspace System para que cada proyecto/espacio tenga una portada operativa con progreso, tareas importantes, próximos vencimientos, pizarras, archivos, actividad reciente, vistas guardadas y accesos rápidos. Requiere aplicar `0058_v58_25_9_5_project_views_home_view_support.sql` para permitir vistas guardadas de tipo `home`.

## v58.25.9.7 — Workspace Empty States + Client QA Hardening

Agrega estados vacíos profesionales y un panel `Workspace Health` para validar visualmente persistencia, espacios, vistas guardadas, permisos y disponibilidad de datos dentro de `/app/workspace`. No agrega migraciones nuevas.
