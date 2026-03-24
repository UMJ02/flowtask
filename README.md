# FlowTask v5.9.1-core-hardening

Base validada sobre `v5.9.0-module-consolidation`.

## Objetivo
Endurecer el core del producto para que Workspace, Projects, Tasks, Clients e Intelligence se sientan más consistentes, más claros y más listos para evolución sin parches.

## Enfoque
- Reforzar la lectura inicial de cada módulo core con métricas rápidas y más contexto operativo
- Conectar mejor el flujo entre Workspace e Intelligence con el resto del core
- Mantener compatibilidad 1:1 con la base anterior sin tocar lógica sensible de detalle

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Cambios clave
- Se agregan componentes reutilizables para métricas del core y navegación entre módulos principales
- Projects, Tasks y Clients arrancan con una lectura rápida más clara antes de filtros o listados
- Workspace e Intelligence refuerzan el puente hacia los demás módulos core
- Se actualiza documentación y versionado a `v5.9.1-core-hardening`
