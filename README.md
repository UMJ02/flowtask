# FlowTask — v58.24.9.2 Organization Delete RPC Schema + Workspace Switch Fix

Base: **v58.24.9.1 — Organization Manage RPC Alignment + Service Role Guard**

## Objetivo

Corregir dos problemas funcionales reales:

1. El borrado de organización fallaba si Supabase todavía no tenía en cache o no tenía aplicada la función `schedule_organization_deletion`.
2. El cambio entre workspace personal y organización podía mostrar datos del workspace anterior hasta refrescar manualmente.

## Cambios clave

### API de organización

`/api/organization/manage` ahora:

- intenta usar RPC:
  - `schedule_organization_deletion`
  - `restore_organization`
  - `purge_organization_data`
- si Supabase responde que `schedule_organization_deletion` o `restore_organization` no existen en schema cache, usa fallback directo seguro sobre `organizations`
- mantiene mensaje claro cuando falta la función de purga para force delete

### Workspace switch

`OrganizationSwitcher` ahora:

- escribe la cookie del workspace activo en cliente inmediatamente
- llama `/api/workspace/active`
- hace navegación programática con `window.location.assign()`
- evita que el usuario tenga que refrescar manualmente para ver los datos correctos

## Requisito recomendado

Aun con fallback, la BD debe tener la migración v58.24.9 aplicada para dejar el lifecycle completo:

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
npm run verify:v58.24.9.2
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
