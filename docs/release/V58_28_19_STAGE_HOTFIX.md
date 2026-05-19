# v58.28.19 Stage Hotfix

Corrección puntual sobre v58.28.19 para mantener el marcador de release requerido por los readiness checks.

## Corrección

- Se restauró `APP_RELEASE_STAGE = "production"` en `src/lib/release/version.ts`.
- `verify:v58.28.19` ahora valida que `APP_RELEASE_STAGE` exista.
- `workspace:final-copy:ready` ahora valida que `APP_RELEASE_STAGE` exista.

## Motivo

`workspace:doctor` esperaba este export y Vercel fallaba antes de continuar con el build.

## Sin cambios en runtime

No se tocaron UI, Supabase, RLS, migraciones, dependencias ni sincronización Clásico/Pro.
