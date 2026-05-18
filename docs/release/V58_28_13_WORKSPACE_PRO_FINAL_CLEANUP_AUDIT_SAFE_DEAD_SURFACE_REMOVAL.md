# v58.28.13 — Workspace Pro Final Cleanup Audit + Safe Dead Surface Removal

## Objetivo

Cerrar la base estable v58.28.12 con una depuración segura para cliente final: menos scripts históricos activos, menos superficies muertas y un inventario claro de lo que queda pendiente para una modularización posterior.

## Cambios principales

- `package.json` reduce scripts activos de 229 a un set operativo de producción.
- `verify:current` apunta a `verify:v58.28.13`.
- `build:preflight` queda enfocado en checks vigentes de producción, Workspace Pro, runtime, TypeScript y deploy.
- Se agrega `workspace:final-cleanup:ready` para validar que la limpieza no rompa la base.
- Se agrega auditoría en `docs/audits/V58_28_13_FINAL_CLEANUP_AUDIT.md`.
- Se mantiene intacto Supabase, RLS, migraciones, rutas clásicas y dependencias.

## No se tocó

- Supabase schema.
- RLS.
- `safe_delete_visual_board`.
- Rutas clásicas `/app/tasks`, `/app/projects`, `/app/boards`, `/app/reports`.
- Dependencias.

## Siguiente paso recomendado

`v58.28.14 — Workspace Pro Component Split + Runtime Slimdown` para dividir el archivo grande `workspace-pro-page.tsx` y cargar cada vista de forma más aislada.
