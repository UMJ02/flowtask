# v58.21.4 — Design System Governance + Core Screen Migration

## Base

Esta versión toma como base `v58.21.3-design-system-foundation-visual-consistency`.

## Objetivo

Convertir el sistema visual de FlowTask en una capa de gobierno real para la app, no solo en tokens declarados.

## Cambios principales

- Versionado actualizado a `58.21.4-design-system-governance-core-screen-migration`.
- Tokens semánticos reforzados en `src/lib/design-system/tokens.ts`.
- Componentes base de gobierno visual agregados:
  - `AppPage`
  - `AppCard`
  - `AppBadge`
  - `AppToolbar`
  - `AppTabs`
  - `AppEmptyState`
- Utilidades globales nuevas:
  - `ft-governed-screen`
  - `ft-core-grid`
  - `ft-toolbar-grid`
  - `ft-data-table`
  - `ft-data-th`
  - `ft-data-td`
  - `ft-action-row`
- Migración inicial de pantallas core:
  - Proyectos lista
  - Tareas lista
  - Shell visual de cards/tablas/toolbar
- `Card`, `Button`, `Input`, `Select` y `Textarea` alineados con la escala base.
- Sin cambios en Supabase, RLS, migraciones ni payloads.

## Criterio UX

La app debe usar una escala visual consistente:

- títulos de página controlados
- secciones claras
- cards con tres niveles
- botones con tamaños definidos
- tablas con espaciado estable
- filtros y toolbars sin desborde

## Validación esperada

```bash
npm run verify:v58.21.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
