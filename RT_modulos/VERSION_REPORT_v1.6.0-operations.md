# FlowTask v1.6.0-operations

## Objetivo
Dar una lectura operativa más ejecutiva del workspace para facilitar seguimiento, cierres semanales y exportación de estado sin depender solo del dashboard.

## Qué incluye
- nuevo módulo de lectura operativa en reportes
- KPIs de operación con foco en tareas activas, vencidas, tareas para hoy y clientes activos
- radar de atención con clientes de mayor carga y tareas foco
- distribución por estado para tareas y proyectos
- nueva salida imprimible `type=operations` en la vista de reportes
- acceso directo a reportes desde el dashboard

## Archivos principales tocados
- `src/lib/queries/reports.ts`
- `src/components/reports/operations-overview.tsx`
- `src/app/(app)/app/reports/page.tsx`
- `src/app/(app)/app/reports/print/page.tsx`
- `src/app/(app)/app/dashboard/page.tsx`
- `README.md`

## Resultado esperado
- mejor visibilidad operativa para jefatura y seguimiento interno
- salida rápida a PDF para estado general, proyectos y operación
- continuidad lista para una siguiente versión orientada a onboarding, automatizaciones externas o centro administrativo
