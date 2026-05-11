# v58.24.9.4 — Task Priority Sync + Fresh Detail State + Attachment Icons + Loader Cleanup

**Base:** v58.24.9.3 — Workspace Kanban Status Isolation + Important Tasks Performance

## Problemas corregidos

1. La estrella no era suficientemente confiable como acción global de “importante”.
2. La lista de tareas no tenía estrella y no priorizaba `priority = alta`.
3. El detalle de tarea podía mostrar fecha vieja al volver a editar.
4. El panel lateral de adjuntos mostraba texto genérico para archivos no imagen.
5. Las transiciones públicas seguían usando loader animado.

## Solución

- Se usa `priority = alta` como fuente única de tarea importante.
- Se agrega toggle de estrella en listado.
- Se ordenan importantes primero en Kanban/listado.
- El detalle usa `localTask` y actualiza estado con la fila confirmada de Supabase.
- Adjuntos usan iconos por tipo de archivo.
- Loaders públicos devuelven `null`; el loading interno usa skeleton.
