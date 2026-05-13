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
