# v58.22.4 — Data Sync Reliability + Mutation Confirmation

Base: v58.22.3 Workspace Board Column Visibility + Production Migration Hotfix
Stage: production-candidate

Esta versión refuerza la confiabilidad de sincronización entre UI y Supabase. La app ya no debe mostrar cambios como guardados en flujos críticos hasta confirmar que Supabase devolvió la fila afectada.

## Cambios principales

- Mutaciones críticas de tareas usan `update(...).select(...).maybeSingle()`.
- Mutaciones críticas de proyectos usan `update(...).select(...).maybeSingle()`.
- Eliminaciones críticas confirman filas devueltas con `delete().select(...)`.
- Inline de tareas confirma persistencia antes de mostrar `Cambios guardados`.
- Inline de proyectos confirma persistencia antes de salir de modo edición.
- Tareas internas de proyecto confirman create/update/toggle/delete.
- Tableros de tareas confirman movimiento de columna antes de conservar estado optimista.
- Adjuntos confirman eliminación en base de datos antes de refrescar.
- Se documenta la diferencia entre datos persistidos en Supabase y preferencias locales en `localStorage`.

## Sin cambios de esquema

- No agrega migraciones Supabase nuevas.
- No cambia RLS.
- No cambia contratos de tablas.
- Mantiene Producción como estado válido desde v58.22.2/22.3.
