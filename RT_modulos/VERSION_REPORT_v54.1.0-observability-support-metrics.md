# FlowTask V54.1.0 — Observability + Support + Metrics

## Base
Esta versión se construyó sobre **V54.0 client final**.

## Objetivo
Agregar observabilidad operativa real sin romper la base ya cerrada para cliente.

## Cambios incluidos
- Nueva telemetría de uso en `usage_events`
- Nuevo registro de errores en `error_logs`
- Endpoint interno `/api/internal/log`
- Endpoint de telemetría `/api/usage/track`
- Endpoint de soporte `/api/support`
- Hook `useErrorLogger`
- Helper `trackEvent`
- Captura de eventos en login, proyectos y tareas
- Vista nueva `/app/support` para operación post-release
- Scripts `verify:v54.1` y `ops:check`
- Versionado central actualizado a `54.1.0-observability-support-metrics`

## Base de datos
Se agrega la migración:
- `0025_v54_1_observability_support_metrics.sql`

Soporte sigue reutilizando `internal_support_tickets` ya existente desde la plataforma administrativa.

## Notas
- Se priorizó compatibilidad con la base actual.
- No se introducen dependencias nuevas.
- La observabilidad es no bloqueante: si falla, no rompe flujos del usuario.
