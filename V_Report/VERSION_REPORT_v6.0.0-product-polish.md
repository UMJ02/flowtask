# VERSION REPORT · v6.0.0-product-polish

Base anterior: `v5.9.1-core-hardening`

## Objetivo
Pulir la experiencia general del producto para que el shell, las entradas de módulo y los estados globales se sientan más premium y más consistentes.

## Cambios aplicados
- Shell general con fondo más trabajado, superficies más limpias y mejor separación visual
- Header con chips de contexto, saludo más útil y señal de sesión activa
- Footer alineado con la nueva versión del producto
- `SectionHeader` ahora soporta badges reutilizables de contexto
- `EmptyState`, `ErrorState` y `LoadingState` reciben polish visual consistente
- `CoreMetricStrip` y `CoreRouteDeck` reciben mejor tratamiento visual
- Reports se simplifica para priorizar PDF/CSV y ruta semanal de salida
- Workspace, Projects, Tasks, Clients e Intelligence incorporan badges de contexto

## Archivos tocados
- `src/app/globals.css`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/app-footer.tsx`
- `src/components/ui/section-header.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/error-state.tsx`
- `src/components/ui/loading-state.tsx`
- `src/components/core/core-metric-strip.tsx`
- `src/components/core/core-route-deck.tsx`
- `src/app/(app)/app/workspace/page.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/clients/page.tsx`
- `src/app/(app)/app/intelligence/page.tsx`
- `src/app/(app)/app/reports/page.tsx`
- `package.json`
- `package-lock.json`
- `README.md`

## Nota de validación
Esta versión prioriza polish visual y consistencia de producto, manteniendo la compatibilidad 1:1 con la base anterior sin reescribir flujos sensibles.
