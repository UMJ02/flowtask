# FlowTask Boards — History, Shortcuts and Minimap

## Propósito

Esta capa convierte la pizarra en un editor más cercano a herramientas visuales modernas: permite explorar el lienzo con menos fricción, recuperar cambios y navegar visualmente por mapas grandes.

## Historial local

El historial usa snapshots de `BoardElement[]` en memoria:

- `historyPast`
- `historyFuture`
- `pushHistorySnapshot()`
- `undoBoardChange()`
- `redoBoardChange()`

Cuando se restaura un snapshot, la app marca elementos restaurados como dirty y marca como soft-deleted los elementos que ya no están en el snapshot. El autosave existente persiste ese estado en Supabase.

## Atajos

Los atajos no corren cuando el foco está dentro de `input` o `textarea`.

- `V`: select
- `H`: hand
- `N`: sticky
- `T`: text
- `R`: shape
- `L`: connector
- `Delete`: borrar selección
- `Cmd/Ctrl + D`: duplicar
- `Cmd/Ctrl + Z`: undo
- `Cmd/Ctrl + Shift + Z` / `Cmd/Ctrl + Y`: redo

## Minimap

`BoardMiniMap` calcula bounds reales de elementos visibles, escala sus posiciones a un panel compacto y dibuja un rectángulo de viewport. Al hacer click en el minimap, se actualiza `viewport.x/y` para centrar aproximadamente esa zona.

## Pan y zoom

- Herramienta Mano (`H`) permite arrastrar el lienzo.
- `Cmd/Ctrl + rueda` ajusta zoom entre 50% y 180%.
- El reset vuelve a `{ x: 0, y: 0, zoom: 1 }`.

## Limitaciones actuales

- El historial es local por sesión, no persistente entre recargas.
- No existe resolución de conflictos realtime todavía.
- Undo de texto puede capturar snapshots frecuentes durante edición intensiva.
- El minimap es funcional MVP, no incluye drag del viewport todavía.
