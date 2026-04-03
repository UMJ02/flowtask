# FlowTask V54.2.1 — DB Cleanup & Index Normalization

Base: V54.2 fixed

## Objetivo
Dejar la base de datos limpia después de mezclar patches y migraciones, sin tocar lógica de negocio ni romper la app.

## Incluye
- limpieza de índices redundantes detectados en auditoría
- conservación de índices canónicos de `client_permissions`, `error_logs`, `usage_events` e `internal_support_tickets`
- `ANALYZE` sobre tablas tocadas para refrescar estadísticas del planner
- versionado a `54.2.1-db-cleanup-index-normalization`

## Índices eliminados
- `client_permissions_org_user_idx`
- `error_logs_org_idx`
- `usage_events_org_idx`

## Índices canónicos reasegurados
- `client_permissions_org_user_client_idx`
- `error_logs_org_created_idx`
- `usage_events_org_created_idx`
- `internal_support_tickets_org_status_created_idx`

## Aplicación
1. Copiar esta versión sobre la base V54.2 actual.
2. Ejecutar `supabase/migrations/0027_v54_2_1_db_cleanup_index_normalization.sql`.
3. Verificar con `npm run verify:v54.2.1` y `npm run db:cleanup-check`.
