# v58.25.9.3 — Workspace Saved Views Defaults + Filters Persistence

## Objetivo

Endurecer las vistas guardadas del Workspace System para que no solo recuerden el tipo de vista, sino también la configuración operativa que el usuario estaba usando: filtros, agrupación, orden y columnas visibles.

## Cambios incluidos

- `/app/workspace` ahora reconoce `savedViewId`.
- Las vistas guardadas aplican su `config.filters` al abrirse.
- Las vistas predeterminadas se aplican automáticamente cuando se abre un proyecto sin `view` explícito.
- Se persisten filtros de estado, agrupación, orden y columnas en `project_views.config`.
- La barra de acciones incluye controles reales para estado, agrupación y orden.
- Cambiar manualmente filtros/orden limpia `savedViewId` para evitar confusión entre una vista guardada y una configuración manual.
- `WorkspaceSavedViewsManager` muestra resumen de filtros guardados por vista.
- `WorkspaceViewTabs` distingue vistas persistidas y vistas predeterminadas.
- El panel derecho indica si hay una vista guardada activa o si se usa configuración manual.

## Sin cambios de base de datos

No se agrega migración nueva. Esta versión usa la tabla ya creada en:

```txt
0056_v58_25_9_workspace_persistence_foundation.sql
```

El campo usado para persistencia es:

```txt
project_views.config jsonb
```

## Validaciones esperadas

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Notas de producto

Esta versión acerca FlowTask al patrón tipo ClickUp/Notion: una vista guardada representa una forma de trabajo, no solo un tab visual.
