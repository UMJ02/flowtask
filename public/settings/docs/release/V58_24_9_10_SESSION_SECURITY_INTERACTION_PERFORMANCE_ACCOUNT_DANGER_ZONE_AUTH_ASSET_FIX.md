# v58.24.9.10 — Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix

**Base:** v58.24.9.9.1 — Visual Style Deduplication + Motion Cleanup Pass

## Qué agrega

- Idle logout de 15 minutos.
- Aviso de sesión cerrada por inactividad.
- Danger Zone en Settings.
- API server-side `/api/account/delete`.
- Migración de estado de eliminación de cuenta.
- Página confirmada con `/check/confirmacion.png`.
- Skeleton shimmer y scroll stability utilities.

## Migración requerida

```txt
supabase/migrations/0054_v58_24_9_10_account_deletion_status.sql
```

## Nota sobre eliminación de cuenta

La acción registra la solicitud en `profiles` y programa organizaciones del usuario para eliminación si la tabla tiene las columnas de lifecycle. Es server-side y requiere service role.
