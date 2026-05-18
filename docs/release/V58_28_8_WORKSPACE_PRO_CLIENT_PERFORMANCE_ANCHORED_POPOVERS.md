# v58.28.8 — Workspace Pro Client Performance + Anchored Popovers

## Objetivo
Reducir la sensación de lentitud del Workspace Pro sin tocar Supabase, RLS ni rutas clásicas.

## Cambios
- Cambio de vistas 100% client-side con `window.history.replaceState`.
- Se elimina la rama de sincronización de vistas que forzaba navegación en Archivos/Reportes.
- Nuevo cintillo animado para “Actualizando vista”.
- Board con estado local optimista para mover tareas y cambiar prioridad sin `router.refresh()` inmediato.
- Popover de acciones del Board anclado dentro de la tarjeta, no en una esquina global.
- Overrides CSS para evitar `content-visibility` en elementos interactivos del Board.
- Menos backdrop blur y sombras pesadas en paneles del Workspace Pro.

## Sin cambios
- No cambia Supabase schema.
- No cambia RLS.
- No agrega dependencias.
- No modifica rutas clásicas.
