# FlowTask v6.2.4-ui-structure-refactor

## Base
- Base usada: v6.2.3-dashboard-reports-intelligence-refinement

## Objetivo
- Reestructurar UI con enfoque claro minimal tipo Stripe.
- Corregir densidad, jerarquía y desbordes en insights, reports y paneles de búsqueda.

## Cambios principales
- Nuevo componente `ExpandableBar` para filtros y búsqueda plegables.
- `projects`, `tasks` y `clients` usan barra desplegable en lugar de card pesada para filtros.
- `filter-presets` pasó a formato barra compacta.
- `reports` elimina el bloque redundante de “Exporta con orden” y deja una barra desplegable de salidas PDF.
- `intelligence` cambia hero inflado por resumen compacto con métricas claras.
- `workspace` reorganiza `Foco del día` para separar badge, label, valor y helper sin apelotonamiento.
- Menos redondeo y más consistencia visual en cards internas.

## Validación ejecutada
- Revisión de sintaxis TSX con `typescript.transpileModule` en todos los archivos modificados.
- Verificación de integridad del ZIP con `unzip -t`.

## Archivos tocados
- `src/components/ui/expandable-bar.tsx`
- `src/components/projects/project-filters.tsx`
- `src/components/tasks/task-filters.tsx`
- `src/components/clients/client-list-panel.tsx`
- `src/components/ui/filter-presets.tsx`
- `src/app/(app)/app/projects/page.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/clients/page.tsx`
- `src/app/(app)/app/reports/page.tsx`
- `src/app/(app)/app/intelligence/page.tsx`
- `src/app/(app)/app/workspace/page.tsx`
- `package.json`
- `package-lock.json`
- `README.md`
