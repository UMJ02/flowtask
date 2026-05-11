# FlowTask — v58.24.9.1 Organization Manage RPC Alignment + Service Role Guard

Base: **v58.24.9 — Workspace Data Isolation + Organization Lifecycle Hardening**

## Objetivo

Alinear `/api/organization/manage` con las funciones RPC de ciclo de vida creadas en v58.24.9 y reducir la dependencia de `SUPABASE_SERVICE_ROLE_KEY` para acciones normales de owner/admin autenticado.

## Cambios clave

- `DELETE /api/organization/manage` usa RPC:
  - `schedule_organization_deletion`
  - `purge_organization_data`
- `PATCH /api/organization/manage` usa RPC:
  - `restore_organization`
- El flujo normal de borrar/restaurar organización ya no usa `createAdminClient()`.
- `createAdminClient()` ahora valida mejor `SUPABASE_SERVICE_ROLE_KEY`.
- `runtime-check` avisa/falla si la service role key parece incorrecta o pertenece a otro proyecto.
- `purgeExpiredOrganizations()` usa `purge_expired_organizations()` para el cron.

## Requisito importante

Antes de probar borrar/restaurar organización, la migración v58.24.9 debe estar aplicada en Supabase:

```sql
select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'schedule_organization_deletion',
    'restore_organization',
    'purge_organization_data',
    'purge_expired_organizations',
    'move_personal_project_to_organization'
  )
order by p.proname;
```

Debe devolver 5 filas.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
