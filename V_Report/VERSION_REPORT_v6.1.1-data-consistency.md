# FlowTask — VERSION REPORT v6.1.1-data-consistency

Base: v6.1.0-functional-hardening

## Objetivo
Alinear tipos y respuestas del core para reducir inconsistencias entre proyectos, tareas y clientes.

## Cambios
- Normalización de tipos base en `src/types/project.ts`, `src/types/task.ts` y `src/types/client.ts`.
- `getProjects()` ahora devuelve un shape consistente con fechas, colaboración y departamento.
- `getTasks()` ahora devuelve un shape consistente con flags `isOverdue` e `isDueToday`.
- `getClients()` y `getClientById()` incorporan `overdueTasksCount` y reusan la misma lógica de atraso.
- `getClientDashboardItems()` reutiliza métricas ya calculadas por `getClients()`.

## Riesgo
Bajo. Los cambios se enfocan en normalización de datos sin alterar rutas ni middleware.

## Validación esperada
- `npm run typecheck`
- navegación core sin cambios visuales agresivos
