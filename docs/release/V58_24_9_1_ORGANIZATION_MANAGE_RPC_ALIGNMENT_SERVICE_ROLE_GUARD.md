# v58.24.9.1 — Organization Manage RPC Alignment + Service Role Guard

**Base:** v58.24.9 — Workspace Data Isolation + Organization Lifecycle Hardening

## Problema corregido

El CLI de v58.24.9 compila correctamente, pero `/api/organization/manage` seguía usando `createAdminClient()` y operaciones manuales con `SUPABASE_SERVICE_ROLE_KEY`. Si esa key estaba inválida o no pertenecía al mismo proyecto Supabase, borrar organización fallaba con:

```txt
Invalid API key
```

Además, v58.24.9 ya había creado funciones RPC para el lifecycle de organización, pero la API todavía no las usaba.

## Cambios

- `DELETE /api/organization/manage`:
  - usa `schedule_organization_deletion` para borrado recuperable
  - usa `purge_organization_data` para force delete
- `PATCH /api/organization/manage`:
  - usa `restore_organization` para reactivar
- `createAdminClient()`:
  - valida que `SUPABASE_SERVICE_ROLE_KEY` exista
  - si la key es JWT, valida role `service_role`
  - si la key tiene `ref`, valida que coincida con `NEXT_PUBLIC_SUPABASE_URL`
- `runtime-check`:
  - reporta estado de `SUPABASE_SERVICE_ROLE_KEY`
  - detecta role incorrecto
  - detecta mismatch de project ref
- `purgeExpiredOrganizations()`:
  - usa RPC `purge_expired_organizations`

## Nota

Esta versión no reemplaza la migración v58.24.9. Las funciones RPC deben existir en Supabase antes de usar la API.
