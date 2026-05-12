# v58.21.3 — Design System Foundation + Visual Consistency

## Base

Esta versión parte de `v58.21.2-layout-cleanup-feed-attachment-refinement`.

## Objetivo

Crear una base visual más sólida y consistente para FlowTask antes de seguir agregando funciones. Esta versión no cambia Supabase, no agrega columnas y no modifica reglas RLS.

## Cambios principales

- Versionado actualizado a `58.21.3-design-system-foundation-visual-consistency`.
- Tokens de diseño centralizados en `src/lib/design-system/tokens.ts`.
- Variables globales de color, radios, sombras y jerarquía visual en `src/app/globals.css`.
- Clases globales reutilizables: `ft-page-title`, `ft-section-title`, `ft-card-title`, `ft-body`, `ft-secondary`, `ft-main-card`, `ft-section-card`, `ft-mini-card`, `ft-control`, `ft-button`, `ft-chip`.
- Botón base normalizado con tamaños `md`, `sm` e `icon`.
- Inputs, selects y textareas normalizados a una escala más consistente.
- Reducción global de pesos excesivos: se reemplaza `font-black` por pesos más moderados para una lectura menos pesada.
- Ajuste de tamaños visuales extremos para que títulos, métricas y botones convivan mejor.
- Documentación QA para revisar consistencia visual en toda la app.

## No incluido

- Sin migraciones Supabase.
- Sin cambios de RLS.
- Sin cambios en payloads de tareas, proyectos o adjuntos.
- Sin rehacer pantallas completas.
- Sin nuevas funciones de negocio.

## Criterio de aprobación

- `npm run verify:v58.21.3`
- `npm run typecheck`
- `npm run build:preflight`
- `npm run build`
- QA visual manual de tareas, proyectos, dashboard, clientes, organización y autenticación.
