# v58.24.9.2 — Organization Delete RPC Schema + Workspace Switch Fix

**Base:** v58.24.9.1 — Organization Manage RPC Alignment + Service Role Guard

## Problema 1

Supabase respondía:

```txt
Could not find the function public.schedule_organization_deletion(p_organization_id, p_retention_days) in the schema cache
```

Eso significa que la función no existe en la BD real o PostgREST todavía no la tiene en cache. La API ahora no se queda bloqueada para el borrado recuperable: si falta esa RPC, hace fallback directo sobre `organizations`.

## Problema 2

Al cambiar entre workspace individual y organización, la vista podía quedarse con datos del workspace anterior hasta refrescar manualmente. Ahora el switch escribe la cookie localmente y navega de forma programática para forzar que el SSR lea el workspace correcto.

## Cambios

- `fallbackScheduleOrganizationDeletion()`
- `fallbackRestoreOrganization()`
- detección de errores `PGRST202`, `42883`, `schema cache`, `could not find the function`
- `persistWorkspaceCookie()`
- `navigateAfterWorkspaceSwitch()`

## Nota

El fallback permite desbloquear el borrado recuperable y restauración, pero la migración v58.24.9 sigue siendo necesaria para purga definitiva completa y migración personal → organización.
