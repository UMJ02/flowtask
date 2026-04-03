# FlowTask v1.9.0-planning-center

## Objetivo
Agregar una capa de planificación operativa que permita anticipar carga, priorizar entregables y ver presión por departamento sin salir del workspace.

## Incluye
- nueva ruta `/app/planning`
- nuevo `PlanningCenter` con:
  - KPIs de esta semana, próxima semana, vencidas y proyectos activos
  - buckets de vencimiento
  - capacidad por departamento
  - clientes con más movimiento
  - foco semanal de tareas
  - pipeline de proyectos
  - recomendaciones accionables
- widget compacto de planning dentro del dashboard
- acceso desde navegación principal
- exportación/imprimible desde `/app/reports/print?type=planning`
- botón `Planning PDF` dentro de reportes

## Archivos principales tocados
- `src/lib/queries/planning.ts`
- `src/components/planning/planning-center.tsx`
- `src/app/(app)/app/planning/page.tsx`
- `src/app/(app)/app/dashboard/page.tsx`
- `src/components/layout/nav-links.ts`
- `src/app/(app)/app/reports/page.tsx`
- `src/app/(app)/app/reports/print/page.tsx`
- `README.md`
- `package.json`

## Validación
- objetivo: `npm run typecheck` en cero
