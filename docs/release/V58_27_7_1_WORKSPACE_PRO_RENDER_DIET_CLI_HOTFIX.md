# v58.27.7.1 — Workspace Pro Render Diet CLI Hotfix

Patch sobre v58.27.7 para corregir validaciones CLI detectadas en entorno local.

## Correcciones

- Corrige `WorkspaceProHome` para leer `overdue` desde `derived.metrics` antes de enviarlo a `WorkspaceProUtilityDock`.
- Agrega `verify:v58.27.7.1` y actualiza `verify:current`.
- Actualiza `workspace:doctor` y checks de readiness para aceptar la línea activa v58.27.x en vez de quedarse bloqueados en v58.27.6.
- Mantiene `workspace:render-diet:ready` alineado con el patch.

## Sin cambios de backend

- No se agregan migraciones.
- No se cambia Supabase.
- No se cambia RLS.
- No se toca `safe_delete_visual_board`.
- No se reemplazan rutas clásicas.
