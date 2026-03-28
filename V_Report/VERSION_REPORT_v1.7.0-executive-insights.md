# FlowTask v1.7.0-executive-insights

## Objetivo
Subir el módulo de reportes desde una lectura operativa a una lectura ejecutiva del workspace, agregando visibilidad sobre capacidad, presión semanal y riesgo de proyectos.

## Cambios principales
- Se corrigieron los errores de TypeScript presentes en `src/lib/queries/reports.ts`.
- Se amplió `getReportsOverview()` con nuevos KPIs:
  - `dueThisWeek`
  - `waitingTasks`
  - `overdueProjects`
- Se agregó agregación por departamento (`departmentLoad`).
- Se agregó watchlist de proyectos (`projectWatchlist`).
- Se reforzó `OperationsOverview` con:
  - ventana crítica
  - capacidad por departamento
  - watchlist de proyectos
  - salida ejecutiva en PDF
- Se actualizó `/app/reports` para exponer el nuevo reporte ejecutivo.
- Se actualizó `/app/reports/print` para soportar `type=executive`.
- Se actualizó `README.md` y `package.json` a la nueva versión.

## Validación
- `npm run typecheck` validado en cero.

## Archivos clave tocados
- `src/lib/queries/reports.ts`
- `src/components/reports/operations-overview.tsx`
- `src/app/(app)/app/reports/page.tsx`
- `src/app/(app)/app/reports/print/page.tsx`
- `README.md`
- `package.json`
