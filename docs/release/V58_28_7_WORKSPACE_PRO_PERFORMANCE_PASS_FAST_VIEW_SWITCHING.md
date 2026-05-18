# v58.28.7 — Workspace Pro Performance Pass + Fast View Switching

## Objetivo
Reducir la sensación de lentitud del Workspace Pro sin tocar Supabase, RLS ni migraciones.

## Cambios
- Las vistas operativas ligeras cambian de forma optimista en cliente sin `router.refresh()`.
- Las vistas que requieren data adicional (`home`, `canvas`, `files`, `reports`) siguen sincronizando con servidor, pero sin refresh doble.
- Se agrega indicador ligero de cambio de vista.
- Se refuerzan hover, active y pressed states para que el usuario perciba el click inmediatamente.
- Se reducen repaints costosos eliminando backdrop blur en overlays del Workspace Pro.
- Se agregan límites de render con `contain` y `content-visibility` en cards, columnas y filas.
- Nuevo check: `workspace:performance-pass:ready`.

## No cambia
- Supabase schema.
- RLS.
- Migraciones.
- safe_delete_visual_board.
- Rutas clásicas.
- Dependencias.
