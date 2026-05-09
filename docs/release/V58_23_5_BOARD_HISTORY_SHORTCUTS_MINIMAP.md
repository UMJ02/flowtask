# FlowTask v58.23.5 — Board History + Shortcuts + Minimap

## Base

Base directa: `v58.23.4 — Board Sharing + Collaboration Layer`.

## Objetivo

Cerrar una capa operativa esencial del editor visual de Pizarras: historial local, atajos de teclado, navegación real por minimap y mejoras de pan/zoom sin agregar nuevas tablas ni modificar RLS.

## Cambios principales

- Historial local de cambios en `BoardPage`.
- Undo con `Cmd/Ctrl + Z`.
- Redo con `Cmd/Ctrl + Shift + Z` y `Cmd/Ctrl + Y`.
- Duplicar elemento seleccionado con `Cmd/Ctrl + D`.
- Borrar selección con `Delete` / `Backspace`.
- Atajos de herramientas: `V`, `H`, `N`, `T`, `R`, `L`.
- Pan real con herramienta Mano (`H`).
- Zoom con `Cmd/Ctrl + rueda`.
- Nuevo componente `BoardMiniMap`.
- Minimap con bounds reales, elementos escalados y viewport clickeable.
- Persistencia de snapshots restaurados mediante autosave existente.

## No cambia

- Supabase schema.
- RLS.
- Sharing público.
- Colaboradores.
- Comentarios/actividad.
- Modelo flexible de `visual_board_elements`.

## Archivos clave

- `src/components/boards/board-page.tsx`
- `src/components/boards/board-minimap.tsx`
- `scripts/verify-v58.23.5.mjs`
- `docs/boards/FLOWTASK_BOARD_HISTORY_SHORTCUTS_MINIMAP.md`

## QA mínimo

1. Abrir una pizarra.
2. Crear una nota con `N` y click en canvas.
3. Moverla.
4. Usar `Cmd/Ctrl + Z` para deshacer.
5. Usar `Cmd/Ctrl + Shift + Z` o `Cmd/Ctrl + Y` para rehacer.
6. Seleccionar elemento y duplicar con `Cmd/Ctrl + D`.
7. Borrar con `Delete`.
8. Cambiar a mano con `H` y arrastrar el canvas.
9. Usar zoom con `Cmd/Ctrl + rueda`.
10. Click en minimap y confirmar que el viewport se mueve.
11. Recargar y validar persistencia.
